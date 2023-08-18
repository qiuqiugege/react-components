export type StoreValue = string | number | boolean;
export type Store = Record<string, StoreValue>;
export type NamePath = string;

export interface Callbacks<Values = Store> {
  onFieldsChange?: (changedFields: NamePath[], allFields: NamePath[]) => void;
  onValuesChange?: (changedValue: StoreValue[], allValues: Store) => void;
  onFinish?: (values: Values) => void;
  onFinishFailed?: (err: IRuleError[]) => void;
  /** i18n 用于读取错误提示信息 */
  t?: (k: string, options?: any) => string;
}

export interface FormInstance<Values = any> {
  store: Store;
  /** 表单是否禁用选项 */
  disabled?: boolean;
  /** 初始化 field 值 */
  initialValues: (initStore: Store) => void;
  /** 交互行为赋值 field */
  changeFieldsValue: (newStore: Store) => void;
  /** 动态设置 field 值 */
  setFieldsValue: (newStore: Store) => void;
  /** 获取指定 field 值 */
  getFieldValue: (name: NamePath) => StoreValue;
  /** 获取全部 field 值 */
  getFieldsValue: () => Values;
  /** 添加或取消订阅 field */
  registerFieldEntities: (entities: FieldEntity) => void;
  /** 更新订阅 */
  updataFieldEntity: (newEntity: FieldEntity) => void;
  /** 更新 form 状态 */
  forceUpdate: () => void;
  /** 表单提交 */
  submit: () => void;
  /** 添加回调，供field 调用 */
  setCallbacks: (callbacks: Callbacks) => void;
  /** 触发表单验证 */
  validateFields: (nameList: NamePath[], options?: { validateOnly?: boolean }) => Promise<Store | IRuleError[]>;
}

export type FieldRule = {
  // 校验类型 -》 提供基础校验类型   string | number | boolean | url | email
  type?: string;
  // 是否需要校验
  required: boolean;
  // 检验失败的message
  message?: string,
  // 提供正则 则使用正则校验
  pattern?: RegExp,
  // 自定义校验，需要返回boolean, true 为校验通过， false为失败
  validator?: (rule: FieldRule, value: StoreValue) => boolean
};

interface FieldEntityProps extends FiledProps {
  children: any;
}

export interface FieldEntity {
  props: FieldEntityProps;
  dispatch: (action: {
    type: EnumFieldActionType,
    options?: any;
  }) => void;
  basicRules?: Record<string, FieldRule>;
}

/**
 * 被监控的对象：依赖项，检索依赖关系
 */
export interface IWatchDependencies {
  [k: NamePath]: NamePath[];
}

export interface IRuleError {
  [name: string]: string | StoreValue;
}

export type FiledProps = {
  // 唯一字段名，必填，否则无法监控子组件
  name: NamePath;
  // 必填样式设置。如不设置，则会根据校验规则自动生成
  required?: boolean;
  // 校验规则，设置字段的校验逻辑。
  rules?: FieldRule[];
  // 为 true 时不带样式，作为纯字段控件使用
  noStyle?: boolean;
  // label
  label: string;
  // 受控组件
  children: React.ReactElement | React.ReactElement[];
  // 自定义字段更新逻辑 TODO - 大部分场景可使用 dependencies 实现
  shouldUpdate?: boolean | ((prevValue: string, curValue: string) => boolean);
  // 设置依赖字段 
  dependencies?: NamePath[];
  // 是否移除 field
  hide?: boolean;
};

export type FiledState = {
  // 是否显示错误状态
  errStatus: boolean;
  // 错误信息
  errInfo?: FieldRule;
  // 输入框value 
  value?: string | boolean | number;
};

export enum EnumFieldActionType {
  CHANGE_VALUE = 'change-value',
  SET_VALUES = 'set-values',
  RULES_FAILED = 'rules-failed',
  CLEAN_ERROR_INFO = 'clean-error-info',
  FORCE_RENDER = 'force-render',
  INIT_VALUE = 'init-value',
}

export interface IFieldActionTyping {
  type: EnumFieldActionType;
  options?: {
    rule?: FieldRule;
    value: string;
  };
}

export interface IFieldActionOptionsTyping {
  rule: FieldRule;
  value?: string;
};

