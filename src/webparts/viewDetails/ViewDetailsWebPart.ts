import { Version } from "@microsoft/sp-core-library";
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { IReadonlyTheme } from "@microsoft/sp-component-base";
//import { escape } from "@microsoft/sp-lodash-subset";
import * as $ from "jquery";

import styles from "./ViewDetailsWebPart.module.scss";
import * as strings from "ViewDetailsWebPartStrings";
import { sp } from "@pnp/sp/presets/all";

export interface IViewDetailsWebPartProps {
  description: string;
}

export default class ViewDetailsWebPart extends BaseClientSideWebPart<IViewDetailsWebPartProps> {
  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = "";

  public async render(): Promise<void> {
    this.domElement.innerHTML = `
    <hr>
    <div id="emp_details"></div>
    <hr>
  <div id="dept_details"></div>
  <hr>
  <div>
  <label>First Name</label><input type="text" id="fName"><br>
  <label>Last Name</label><input type="text" id="lName"><br>
  <label>Date of Birth</label><input type="date" id="dob"><br>
  <label>Relationship</label><input type="text" id="relationship"><br>
  <label>gender</label><select id="gender"><br>
  <option value="male">Male</option>
  <option value="female">Female</option>
  </select><br>
  <button id="input">input</button>
  <button id="update">update</button>
  <button id="delete">delete</button>
  </div>
  <hr>
  `;
    let url = new URL(window.location.href);
    let dom = this.domElement;
    let id = Number(url.searchParams.get("emp_id"));
    const item = sp.web.lists.getByTitle("employee").items.getById(id).get();
    let fname = "";
    let lname = "";
    let email = "";
    let gender = "";
    let Country = "";
    item
      .then(function (result) {
        fname = result.Title;
        lname = result.field_1;
        email = result.field_2;
        gender = result.field_3;
        Country = result.field_4;
      })
      .then(function () {
        const emp_detail_container = document.getElementById("emp_details");
        emp_detail_container.innerHTML =
          `
<span>First Name: ` +
          fname +
          `</span><br>
<span>Last Name: ` +
          lname +
          `</span><br>
<span>Email: ` +
          email +
          `</span><br>
<span>Gender: ` +
          gender +
          `</span><br>
<span>Country: ` +
          Country +
          `</span><br>

   `;
      });

    
    await this.displayDept(id)
    this.depInput(id)

   
      
  }

  public async depInput(id: number){
    let currentobj = this;
    /**
     * Input an element in the list
     */
    let inputbtn = document.getElementById("input");

    inputbtn.addEventListener("click", async function () {
      //alert("ok")
      const fname = $("#fName").val();
      console.log("----" + fname);
      const lname = $("#lName").val();
      const dob = $("#dob").val();
      const relationship = $("#relationship").val();
      const gender = $("#gender").val();
      await sp.web.lists.getByTitle("Employee_dependent").items.add({
        emp_id: id,
        firtstName: fname,
        lastName: lname,
        DOB: dob,
        relationship: relationship,
        gender: gender,
      });

      await currentobj.render();
      $("#fName").val("");
      $("#lName").val("");
      $("#dob").val("");
      $("#relationship").val("");
      $("#gender").val("");
    });
    /**
     * Delete an element in the list
     */
    const delbtn = document.getElementById("delete");
    delbtn.addEventListener("click", async function () {
      const del_id = Number($('input[name="itemID"]:checked').val());
      if (!del_id) {
        alert("select one please");
      } else {
        const item = await sp.web.lists
          .getByTitle("Employee_dependent")
          .items.getById(del_id)
          .delete();

        await currentobj.render();
        $("#fName").val("");
        $("#lName").val("");
        $("#dob").val("");
        $("#relationship").val("");
        $("#gender").val("");
      }
    });

    /**
     * Update an element in the list
     */
    const radios = document.querySelectorAll("#itemID");
    console.log("Radio =====" + radios)
    radios.forEach((radio) => {
      radio.addEventListener("click", async function () {
        //alert("ok")
        const up_id = Number($('input[name="itemID"]:checked').val());
        console.log(up_id)
        const item = await sp.web.lists
          .getByTitle("Employee_dependent")
          .items.getById(up_id)
          .get();

        $("#fName").val(item["firtstName"]);
        $("#lName").val(item["lastName"]);
        $("#dob").val(item["DOB"]);
        $("#relationship").val(item["relationship"]);
        $("#gender").val(item["gender"]);
      });
    });

    const updatebtn = document.getElementById("update");
    updatebtn.addEventListener("click", async function () {
      //alert("ok")
      const up_id = Number($('input[name="itemID"]:checked').val());
      if (!up_id){
        alert("please select one");
      } else {
        const empId = up_id;
        const fname = $("#fName").val();
        const lname = $("#lName").val();
        const dob = $("#dob").val();
        const relationship = $("#relationship").val();
        const gender = $("#gender").val();

        await sp.web.lists
          .getByTitle("Employee_dependent")
          .items.getById(up_id)
          .update({
            emp_id: empId,
            firtstName: fname,
            lastName: lname,
            DOB: dob,
            relationship: relationship,
            gender: gender,
          });
      }
    });
  }

  public async displayDept(id: number){
    return new Promise<void>((resolve, reject) => {
      
   
    let dept_details = document.getElementById("dept_details");
    let table = `
      <table class="${styles.table}">
        <tr>
          <th></th>
          <th>First name</th>
          <th>Last name</th>
          <th>Date of birth</th>
          <th>Relationship</th>
          <th>Gender</th>
        </tr>
        `;
       sp.web.lists
      .getByTitle("Employee_dependent")
      .items.filter("emp_id eq '" + id + "'")
      .getAll()
      .then(function (results) {
        results.forEach((item) => {
          //console.log(item.ID)
          table += `
            <tr>
            <td><input type="radio" name="itemID" value="` + item.ID + `" id = "itemID"></td>
            <td >` + item.firtstName + `</td>
            <td>` + item.lastName + `</td>
            <td>` + item.DOB + `</td>
            <td>` + item.relationship + `</td>
            <td>` + item.gender + `</td>
            </tr>
            `;
        });

        // console.log(results);

        table += `</table>`;
        dept_details.innerHTML = table
        resolve()
      })

    })
  }

  protected onInit(): Promise<void> {
    this._environmentMessage = this._getEnvironmentMessage();
    sp.setup({
      spfxContext: this.context as any,
    });
    return super.onInit();
  }

  private _getEnvironmentMessage(): string {
    if (!!this.context.sdks.microsoftTeams) {
      // running in Teams
      return this.context.isServedFromLocalhost
        ? strings.AppLocalEnvironmentTeams
        : strings.AppTeamsTabEnvironment;
    }

    return this.context.isServedFromLocalhost
      ? strings.AppLocalEnvironmentSharePoint
      : strings.AppSharePointEnvironment;
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty(
        "--bodyText",
        semanticColors.bodyText || null
      );
      this.domElement.style.setProperty("--link", semanticColors.link || null);
      this.domElement.style.setProperty(
        "--linkHovered",
        semanticColors.linkHovered || null
      );
    }
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
