import {MainControllerInterface} from "../mainControllerFolder/mainControllerInterface"
import * as pageViewHelperFunction from "../pageViewHelperFunction"

export function buildUserController(mainController: MainControllerInterface){
    let userControllerNavbarTitle = document.createElement("div");
    userControllerNavbarTitle.classList.add("userControllerNavbarTitle", "subPanelTitle")
    userControllerNavbarTitle.innerText = "User"

    let userViewer = document.createElement("div")
    userViewer.classList.add("userViewer")
    userViewer.style.width = "80%"
    userViewer.style.height = "200px"
    userViewer.style.margin = "5px auto"
    userViewer.style.background = "pink"




    let userControllerWrapper = createUserControllerWrapper(userViewer)


    // controller bar
    let userControllerBar = document.createElement("div")
    userControllerBar.classList.add("userControllerBar")
    let addUserButton = document.createElement("button")
    addUserButton.classList.add("addUserButton")
    addUserButton.innerText = "add User"
    addUserButton.addEventListener("click", e=>{
        let userRow = createUserRow()

        userViewer.append(userRow)
    })

    userControllerBar.append(addUserButton)
    userControllerWrapper.append(userViewer, userControllerBar)
    return [userControllerNavbarTitle, userControllerWrapper]
}

interface UserRowInterface {
    userName: string
    userID: string
    pageAccessPointer: string

}



export function createUserRow(injectedData?: any){
    let userRow = document.createElement("div")
    let userNameField = document.createElement("div")
    userNameField.contentEditable = "true"
    userNameField.innerText = "User"

    if (injectedData) {
        userNameField.innerText = injectedData.userName
    } else {
        let userData = {
          userName: userNameField.innerText,
          // userID: string,
          // pageAccessPointer: string
        }

    }



    userRow.append(userNameField)




    return userRow
}


export function createUserControllerWrapper(userViewer: any){
    let userControllerWrapper = <any> document.createElement("div");
    userControllerWrapper.classList.add("userControllerWrapper")

    return userControllerWrapper
} // createcollectionControllerWrapper
