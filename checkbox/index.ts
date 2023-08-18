

import InternalCheckbox from "./checkbox"
import { Group } from "./group";

type CheckboxType = typeof InternalCheckbox;

interface ICheckboxGroup extends CheckboxType {
    Group: typeof Group;
}

const Checkbox = InternalCheckbox as ICheckboxGroup;

Checkbox.Group = Group;

export default Checkbox; 