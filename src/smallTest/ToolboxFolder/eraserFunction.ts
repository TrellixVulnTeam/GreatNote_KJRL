import * as GreatNoteSvgDataClass from "../GreatNoteClass/GreatNoteSvgDataClass"
import * as ToolBoxHelperFunction from "./toolBoxHelperFunction"
import { MainControllerInterface } from "../mainControllerFolder/mainControllerInterface"
import * as Settings from "../settings"

export function detectCollision(svgBoard:any, eraser: any){
    let objectsInTheLayer = svgBoard.querySelectorAll("polyline")
    let newPoint = svgBoard.createSVGPoint();
    objectsInTheLayer.forEach((object:any)=>{
        let lineArray = object.soul.array().value
        Array.from(lineArray).forEach((p:any)=>{
          newPoint.x = p[0]
          newPoint.y = p[1]
          if (eraser.isPointInFill(newPoint)){
                object.deleteFromDatabase()
                return
          }
        })
        return
    })
}

export function eraserMouseDownFunction(e: any, mainController: MainControllerInterface, svgBoard: any, moveEventName:string, upEventName:string){
    if (!mainController.toolBox.checkToolBoxItemStatus("eraserItemButton")){
        return
    }

    let [offsetX, offsetY, touchIsPen] = ToolBoxHelperFunction.getOffSetXY(e)
    // touchIsPen = true
    if (!touchIsPen) return
    e.preventDefault()

    let eraserRadiusInput = <HTMLInputElement> document.querySelector(".eraserRadiusInput")

   if (e.type=="mousedown" || touchIsPen){
        let cx = offsetX + "px"
        let cy = offsetY + "px"
        let r = eraserRadiusInput.value
        let eraser  = GreatNoteSvgDataClass.GNSvgCircle({name: "123", arrayID: "", insertPosition: false, dataPointer: false, saveToDatabase: false})

        eraser.style["cx"] = cx
        eraser.style["cy"] = cy
        eraser.style["r"] = r + "px"

        let mouseMoveFunction = (e)=>{
            // t1 = t2
            // t2 = e.timeStamp
            let [offsetX, offsetY, touchIsPen] = ToolBoxHelperFunction.getOffSetXY(e)

            let logTest = `offsetX = ${offsetX} <br>` + `offsetY = ${offsetY}`

            ToolBoxHelperFunction.locationLog(logTest)


            eraser.style["cx"] = offsetX
            eraser.style["cy"] = offsetY
            detectCollision(svgBoard, eraser)
        }

        let mouseUpFunciton = (e)=>{
          svgBoard.removeEventListener(moveEventName, mouseMoveFunction)
          svgBoard.removeEventListener(upEventName, mouseUpFunciton)
          eraser.remove()
        }

        svgBoard.addEventListener(moveEventName, mouseMoveFunction)

        svgBoard.addEventListener(upEventName, mouseUpFunciton)

        svgBoard.appendChild(eraser)
    }// if (e.type=="mousedown" || touchIsPen)
} // eraserMouseDownFunction
