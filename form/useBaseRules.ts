import useI18n from "@/hooks/useI18n"
import { useStore } from "@/providers/index";
import { regPhone, regEmail } from "@/utils/regs";

import { FieldRule } from "./interface";

/**
 * 返回i基础验证类型
 * @returns 
 */
export const useBasicRule = () => {
    const { t } = useI18n('component');
    const { appStore } = useStore();

    // const typeMsgTemplate = '${label} is not a valid ${type}';
    const typeMsgTemplate = t('form.useBasicRules.typeMsgTemplate');
    const rules = {
        // string: {
        //     type: 'string',
        //     required: true,
        //     message: typeMsgTemplate,
        // },
        // 'method',
        // 'array',
        // 'object',
        // 'number',
        // 'date',
        // 'boolean',
        // 'integer',
        // 'float',
        // 'regexp',
        // 'url',
        // 'hex',
        email: {
            type: 'email',
            required: true,
            message: typeMsgTemplate,
            pattern: regEmail,
        }
    }

    return rules;
}


// const defaultValidateMessages = {
//     default: 'Field validation error for ${label}',
//     required: 'Please enter ${label}',
//     enum: '${label} must be one of [${enum}]',
//     whitespace: '${label} cannot be a blank character',
//     date: {
//         format: '${label} date format is invalid',
//         parse: '${label} cannot be converted to a date',
//         invalid: '${label} is an invalid date',
//     },
//     types: {
//         string
//         method
//         array
//         object
//         number
//         date
//         boolean
//         integer
//         float
//         regexp
//         email
//         url
//         hex
//     },
//     string: {
//         len: '${label} must be ${len} characters',
//         min: '${label} must be at least ${min} characters',
//         max: '${label} must be up to ${max} characters',
//         range: '${label} must be between ${min}-${max} characters',
//     },
//     number: {
//         len: '${label} must be equal to ${len}',
//         min: '${label} must be minimum ${min}',
//         max: '${label} must be maximum ${max}',
//         range: '${label} must be between ${min}-${max}',
//     },
//     array: {
//         len: 'Must be ${len} ${label}',
//         min: 'At least ${min} ${label}',
//         max: 'At most ${max} ${label}',
//         range: 'The amount of ${label} must be between ${min}-${max}',
//     },
//     pattern: {
//         mismatch: '${label} does not match the pattern ${pattern}',
//     },
// }