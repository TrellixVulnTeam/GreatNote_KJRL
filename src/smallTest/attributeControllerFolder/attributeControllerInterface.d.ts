export interface HTMLObjectControllerInterface extends HTMLDivElement {
    controllerArray: HTMLDivElement[];
    targetHTMLType: any;
    attachTo(htmlObject: any): void;
    responseToHtmlType(htmlObject: any): void;
    extract(): any;
}
export interface ControllerInterface extends HTMLDivElement {
    controllerTarget: HTMLElement;
    setControllerTarget(target: HTMLElement): void;
    updateObject(item?: any): void;
    clear(): void;
    extract(): string;
}
export interface ChoiceControllerInterface extends ControllerInterface {
    updateObject(item: any): void;
}
export interface DropdownListControllerInterface extends ControllerInterface {
    updateObject(item?: any): void;
}
export interface PolylineControllerInterface extends HTMLObjectControllerInterface {
    stroke: string;
    strokeWidth: string;
}
export interface ControllerOptionInterface {
    attributeName: string;
    controllerType: any;
    prototype?: HTMLElement;
}
export interface DropdownListControllerOptionInterface extends ControllerOptionInterface {
    selectionList: string[];
}
export interface LengthControllerOptionInterface extends ControllerOptionInterface {
    unitOptions: string[];
}
