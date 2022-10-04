import { DisplayMode, Version } from "@microsoft/sp-core-library";
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { IReadonlyTheme } from "@microsoft/sp-component-base";
//import { escape } from "@microsoft/sp-lodash-subset";
import * as $ from "jquery";

import styles from "./NoJsWebPart.module.scss";
import * as strings from "NoJsWebPartStrings";

import { SearchResults, sp } from "@pnp/sp/presets/all";
import { getMaxListeners } from "gulp";
import { result } from "lodash";

export interface INoJsWebPartProps {
  description: string;
}

export default class NoJsWebPart extends BaseClientSideWebPart<INoJsWebPartProps> {
  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = "";

  public async render(): Promise<void> {
    var currentobj = this;
    this.domElement.innerHTML = `
    <h1>crud No Js</h1>
    `;
    await this.display()
    await this.io();
    /**
     * Input an element in the list
     */
    let inputbtn = document.getElementById("input");
    inputbtn.addEventListener("click", async function () {
      const fname = $("#fname").val();
      const lname = $("#lname").val();
      const email = $("#email").val();
      await sp.web.lists.getByTitle("employee").items.add({
        Title: fname,
        field_1: lname,
        field_2: email,
      });

      await currentobj.render();
      $("#fname").val("");
      $("#lname").val("");
      $("#email").val("");
    });
    /**
     * Delete an element in the list
     */
    const delbtn = document.getElementById("delete");
    delbtn.addEventListener("click", async function () {
      const id = Number($('input[name="itemID"]:checked').val());
      if (!id) {
        alert("select one please");
      } else {
        const item = await sp.web.lists
          .getByTitle("employee")
          .items.getById(id)
          .delete();

        await currentobj.render();
        $("#fname").val("");
        $("#lname").val("");
        $("#email").val("");
      }
    });

    /**
     * Update an element in the list
     */
    const radios = document.querySelectorAll("#itemID");

    radios.forEach((radio) => {
      radio.addEventListener("click", async function () {
        const id = Number($('input[name="itemID"]:checked').val());
        const item = await sp.web.lists
          .getByTitle("employee")
          .items.getById(id)
          .get();

        $("#fname").val(item["Title"]);
        $("#lname").val(item["field_1"]);
        $("#email").val(item["field_2"]);
      });
    });

    const updatebtn = document.getElementById("update");
    updatebtn.addEventListener("click", async function () {
      const id = Number($('input[name="itemID"]:checked').val());
      if (!id) {
        alert("please select one");
      } else {
        const fname = $("#fname").val();
        const lname = $("#lname").val();
        const email = $("#email").val();

        await sp.web.lists.getByTitle("employee").items.getById(id).update({
          Title: fname,
          field_1: lname,
          field_2: email,
        });
      }
    });
  }

  /**
   * display the main section(table)
   */
  public async display() {
    const items: any[] = await sp.web.lists.getByTitle("employee").items.getAll();

    let table = ` <div>
      <table class="${styles.table}">
      <tr>
      <th></th>
      <th id="${styles.name}">first name</th>
      <th>last name</th>
      <th>email name</th>
      <th>View More</th>
      <th>Number of dependents</th>
      </tr>
      `;
    await Promise.all(items.map(async (item) => {
      var deptCount = 0
      await this.numDep(item.ID).then((reponse)=>{
        deptCount=reponse
      })
      console.log("main",deptCount)
      table +=
        `<tr>            
              <td><input type="radio" name="itemID" value="${item.ID} id ="itemID"></td>
              <td>${item.Title}</td>
              <td>${item.field_1}</td>
              <td>${item.field_2}</td>
              <td><a href="https://frcidevtest.sharepoint.com/sites/muntaswir-test/SitePages/Employee-details.aspx?emp_id=${item.Id}">View Details</a></td>
              <td>${deptCount}</td>
            </tr>`;
    }));
    table += `</table>
            </div>`;

    this.domElement.innerHTML += table;
  }

  public numDep(id: number) {
    return new Promise<number>(async (resolve) => {
      await sp.web.lists
        .getByTitle("Employee_dependent")
        .items.filter(`emp_id eq ${id}`)
        .getAll().then((result) => {
          console.log("Dep Reponse", result);
          console.log("Dep Reponse length", result.length);
          resolve(result.length);
        }).catch((error) => {
          console.log("Dep error", error);
        });
    });
  }

  /**
   * Represents input section
   */
  public async io() {
    let input = `
    <div class = "io">
    <label>firstName</label><input type = "text" id = "fname" name = "fname"><br>
    <label>lastName</label><input type = "text" id = "lname" name = "lname"><br>
    <label>email</label><input type = "text" id = "email" name = "email"><br>
    <button id="input">input</button>
    <button id="update">update</button>
    <button id="delete">delete</button>
    </div>
    `;

    return (this.domElement.innerHTML += input);
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
