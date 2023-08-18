import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import {
  Store,
  NamePath,
  Callbacks,
  FormInstance,
  FieldEntity,
  FieldRule,
  EnumFieldActionType,
  IWatchDependencies,
  IRuleError,
  StoreValue,
} from "./interface";

class FormStore {

  private store: Store = {};


  private callbacks: Callbacks = {};


  private fieldEntities: FieldEntity[] = [];


  private watchDependencies: IWatchDependencies = {};


  private initValues: Store = {};

  //
  public forceUpdate;


  constructor(options: {
    forceReRender: () => void;
  }) {
    this.forceUpdate = options.forceReRender;
  }

  /** 获取状态 */
  getFieldsValue = () => {
    const hideEntities = this.fieldEntities.map(entity => entity.props.hide ? entity.props.name : '').filter(name => name !== '');

    const data = { ...this.store };

    hideEntities.forEach(name => {
      data[name] && delete data[name];
    })
    return { ...data };
  };


  /** 获取指定state */
  getFieldValue = (name: NamePath) => {
    return this.store[name];
  };

  /**
   * rule 检测逻辑
   * rule 所有检测逻辑全部在这个方法里面写
   */
  validateField = (entity: FieldEntity, options: { validateOnly?: boolean } = { validateOnly: false }): IRuleError[] => {
    const { name, rules = [], children, label } = entity.props;

    const err: IRuleError[] = []

    const value: StoreValue = name && this.getFieldValue(name);

    const verifyRules: FieldRule[] = [...rules];

    const { t } = this.callbacks;

    /** rule错误处理 */
    const errHandle = (rule: FieldRule) => {
      rule.message = rule && rule.message || t && t('form.useBasicRules.stringEnter', { label: label }) || '';
      /** 保存错误rule信息 */
      name && err.push({ [name]: rule.message, value })
      /* 下发错误，处理失败交互, 仅校验模式不下发*/
      name && !options.validateOnly && this.ruleErrHandle(entity, rule);
    }

    verifyRules.forEach(rule => {
      /** 
       * 判断监控的组件是否是禁用状态，禁用直接跳过
       * 判断field是否被隐藏， 隐藏时直接跳过检测
       */
      if (children?.props.disabled || entity.props.hide) return;

      /** 校验逻辑， 先判断是否需要校验， 需要校验再判断是否已有校验规则存在*/
      if ((rule && !rule.required) || err.length > 0) return;

      /** 校验逻辑， 判断是否是自定义校验, 通过直接return */
      if (rule.validator && !(rule.validator(rule, value))) {
        return errHandle(rule);
      };

      /** 校验逻辑， 如果有正则参数，则使用正则判断，通过直接return */
      if (typeof value === 'string' && rule.pattern && !rule.pattern.test(value)) {
        return errHandle(rule);
      };

      /** 
       * 为空校验，默认取rulelist 第一个message
       * 校验逻辑， 如果没有传递校验规则，则使用基础校验规则，判断是否为空，通过直接return 
       */
      if (value === undefined || value === "") {
        return errHandle(rule);
      };

      /** 内置的基础判断逻辑，根据传入的type进行判断, 例如email phone */
      Object.keys(entity.basicRules || []).forEach((key) => {
        if (key !== rule.type) return;
        const basicRule = entity.basicRules && entity.basicRules[key];
        if (typeof value === 'string' && basicRule && !basicRule.pattern?.test(value)) {
          errHandle({
            ...basicRule,
            message: basicRule.message?.replace('${label}', label),
          });
        }
      });
    });

    /** 没有任何错误时 清除错误信息 */
    err.length === 0 && !options.validateOnly && this.ruleSuccessFulHandle(entity);

    return err;
  }

  /**
   * rule验证失败，下发错误处理
   */
  ruleErrHandle = (entity: FieldEntity, rule: FieldRule) => {
    entity.dispatch({
      type: EnumFieldActionType.RULES_FAILED,
      options: {
        rule
      }
    });
  }

  /**
   * rule验证成功，下发清除错误信息处理
   */
  ruleSuccessFulHandle = (entity: FieldEntity) => {
    entity.dispatch({
      type: EnumFieldActionType.CLEAN_ERROR_INFO,
    });
  }

  /**
   * 批量处理rule
   * @returns 
   */
  batchValidateField = (entities?: FieldEntity[], options?: { validateOnly?: boolean }) => {
    const err: IRuleError[] = [];
    const verifyEntites = entities && entities.length > 0 ? entities : this.fieldEntities;
    verifyEntites.forEach((entity) => {
      const { name } = entity.props;
      name && this.getFieldValue(name);

      err.push(...this.validateField(entity, options));
    });
    return err;
  };


  /** 初始化受控组件默认值 */
  initialValues = (initStore: Store) => {
    // 初始化方法只允许调用一次
    // if (JSON.stringify(this.initValues) !== '{}') {
    //   return console.warn('The initialValues is only allowed to be called once during initialization');
    // }

    this.initValues = initStore;

    /** 更新内部状态 */
    // TODO 没有的值不添加
    this.setStore(initStore);

    /** 状态更新下发到field */
    this.valueTransmit(initStore, 'init');
  }

  /** 
   * 动态设置表单的值，供form主动调用
   */
  setFieldsValue = (newStore: Store,) => {
    /** 更新内部状态 */
    this.setStore(newStore);

    /** 状态更新下发到field */
    this.valueTransmit(newStore);
  };

  /** 
   * 通过change 设置录入表单值
   */
  changeFieldsValue = (newStore: Store) => {
    /** 更新内部状态 */
    this.setStore(newStore);

    /** 状态更新下发到field */
    this.valueTransmit(newStore);

    const { onFieldsChange, onValuesChange } = this.callbacks;

    /** 父组件回调 获取更改的 field 和 value */
    onFieldsChange && onFieldsChange(Object.keys(newStore), this.fieldEntities.map(field => field.props.name));

    onValuesChange && onValuesChange(Object.keys(newStore).map(name => newStore[name]), this.getFieldsValue());
  };

  /** 
   * 绑定回调事件
   * onFinish,  
   * onFinishFailed
   */
  setCallbacks = (callbacks: Callbacks) => {
    this.callbacks = { ...this.callbacks, ...callbacks };
  };

  /** 更新状态 */
  private setStore = (store: Store) => {
    Object.assign(this.store, { ...store });
  }

  /** 
   * 下发value + rule 匹配情况 
   * type = init | change | set
   */
  private valueTransmit = (store: Store, type?: string) => {
    // update Filed
    this.fieldEntities.forEach((entity) => {
      Object.keys(store).forEach((n) => {
        // 组件 name 属性作为唯一ID
        const { name } = entity.props;

        if (n !== name) return;

        const action = {
          type: type === 'init' ? EnumFieldActionType.INIT_VALUE : EnumFieldActionType.CHANGE_VALUE,
          options: {
            value: this.store[name],
          }
        }

        entity.dispatch(action);

        /** 验证rule */
        this.validateField(entity);

        /** 
         * 处理依赖状态 
         * 判断是否有 watch 对象
         */
        this.watchDependencies[name]
          && this.watchDependencies[name].length > 0
          && this.dependenciesHandle(name);
      });
    });
  }

  /** 
   * 订阅与取消订阅
   * entity 受控组件
  */
  registerFieldEntities = (entity: FieldEntity) => {
    /** 相同name多次注册，提示错误 */
    if (this.fieldEntities.some(item => item.props.name === entity.props.name)) {
      return console.error(`The "${entity.props.name}" attribute is already registered, only the last one will take effect`);
    }

    /** 添加 field 订阅 */
    this.fieldEntities.push(entity);

    /** 添加监控对象，匹配依赖项 */
    entity.props.dependencies
      && entity.props.dependencies.length > 0
      && this.dependenciesConnection(entity);

    /**
     * 取消指定的 field 订阅
     */
    return () => {
      /** 传入的entity， 卸载时可能已经被更改， 因此只能使用唯一name，其它属性应该取最新的 */
      const oldEntity = entity;
      const { name } = oldEntity.props;

      /** 获取最新的 entity */
      const currentEntity = this.fieldEntities.find((item) => item.props.name === name);
      // 清除对应的 filed
      this.fieldEntities = this.fieldEntities.filter((item) => item.props.name !== name);
      // 清除store中对应的字段
      // name && delete this.store[name];

      // 判断是否有依赖项, 解除对应的依赖关系
      currentEntity &&
        currentEntity.props.dependencies &&
        currentEntity.props.dependencies.length > 0 &&
        this.dependenciesDisConnect(currentEntity);
    };
  };

  /**
   * 更新订阅字段
   */
  updataFieldEntity = (newEntity: FieldEntity) => {
    const currentEntity = this.fieldEntities.find(currentEntity => currentEntity.props.name === newEntity.props.name);
    /** 未注册的field，弹出错误 */
    if (!currentEntity) {
      return console.error(`The "${newEntity.props.name}" is not registered`)
    }

    /** 更新订阅 */
    this.fieldEntities = this.fieldEntities.map((currentEntity) => {
      return currentEntity.props.name === newEntity.props.name ? newEntity : currentEntity;
    });

    /** 
     * 添加监控对象,
     * 先注销依赖项，再重新添加。
     */
    currentEntity.props.dependencies &&
      currentEntity.props.dependencies.length > 0 &&
      this.dependenciesDisConnect(currentEntity);

    !newEntity.props.hide && newEntity.props.dependencies &&
      newEntity.props.dependencies.length > 0 &&
      this.dependenciesConnection(newEntity);
  };

  /**
   * field 之间建立依赖关系
   * @param entity 
   */
  private dependenciesConnection = (entity: FieldEntity) => {
    const { dependencies, name: dename } = entity.props;

    /** 判断是否传入依赖项， 循环依赖值， 判断 watch 服务中是否存在， 不存在则添加 */
    dependencies && dependencies.forEach((watchName: string) => {
      const watchField = this.watchDependencies[watchName];
      if (watchField && watchField.indexOf(dename) === -1) {
        return watchField.push(dename);
      }

      this.watchDependencies[watchName] = [dename];
    });
  }

  /**
   * field 卸载时，清除field依赖关系
   * @param entity 
   */
  private dependenciesDisConnect = (entity: FieldEntity) => {
    const { dependencies, name: dename } = entity.props;

    /** 判断是否传入依赖项， 循环依赖值， 判断 watch 服务中是否存在， 不存在则添加 */
    dependencies && dependencies.forEach((watchName: string) => {
      /** 过滤掉监控项中的被依赖项*/
      this.watchDependencies[watchName] = this.watchDependencies[watchName].filter(currentDename => dename !== currentDename);
    });

    /** 更新 form 状态 */
    // this.forceUpdate();
  }

  /**
   * 监控项数据变化时，通知依赖项 field 视图更新， 并且检验 rule 。  最后通知 form 更新表单
   * @param entity 
   */
  private dependenciesHandle = (watchName: string) => {
    // const { dependencies, name: dename } = entity.props;

    this.watchDependencies[watchName].forEach((dename) => {
      const entity = this.fieldEntities.find(item => item.props.name === dename);
      entity && entity.dispatch({
        type: EnumFieldActionType.FORCE_RENDER,
      });

      /** 验证rule - 依赖变化时有值才做校验 */
      entity && this.store[entity.props.name] && this.validateField(entity);
    });

    /** 更新 form 状态 */
    this.forceUpdate();
  }

  /**
   * 手动验证表单rule
   * @param nameList 
   * @param options 
   * @returns 
   */
  validateFields = (nameList: NamePath[], options?: { validateOnly?: boolean }): Promise<Store | IRuleError[]> => {
    let err: IRuleError[] = [];
    let values: Store = {};
    if (nameList.length === 0) {
      /** 批量验证rule是否合法 */
      err = this.batchValidateField([], options);

      values = { ...this.store }
    } else {
      const entities: FieldEntity[] = [];
      nameList.forEach(name => {
        const entity = this.fieldEntities.find(entity => entity.props.name === name);
        entity && entities.push(entity);

        values[name] = this.store[name];
      });

      err = this.batchValidateField(entities, options);

    }

    return err.length === 0 ? Promise.resolve(values) : Promise.reject(err);
  }

  /**
   * form 提交处理
   */
  submit = () => {
    const { onFinish, onFinishFailed } = this.callbacks;
    /** 批量验证rule是否合法 */
    const err = this.batchValidateField();
    if (err.length === 0) {
      onFinish && onFinish(this.getFieldsValue());
    } else {
      onFinishFailed && onFinishFailed(err);
    }
  };

  /**
   * 返回form实例
   * @returns 
   */
  getForm = (): FormInstance => {
    return {
      store: this.store,
      getFieldsValue: this.getFieldsValue,
      getFieldValue: this.getFieldValue,
      setFieldsValue: this.setFieldsValue,
      changeFieldsValue: this.changeFieldsValue,
      submit: this.submit,
      setCallbacks: this.setCallbacks,
      registerFieldEntities: this.registerFieldEntities,
      initialValues: this.initialValues,
      updataFieldEntity: this.updataFieldEntity,
      forceUpdate: this.forceUpdate,
      validateFields: this.validateFields,
    };
  };
}

/**
 * 
 * @param forceUpdate 强制渲染form回调
 * @param form 入参
 * @returns 
 */
function initFormRef<Values = any>(forceUpdate: Dispatch<SetStateAction<{}>>, form?: FormInstance<Values>) {
  if (form) {
    return form;
  }
  const forceReRender = () => {
    forceUpdate({});
  };

  const formStore = new FormStore({
    forceReRender,
  });
  return formStore.getForm();
}

export default function useForm<Values = any>(
  form?: FormInstance<Values>
): [FormInstance<Values>] {
  // const [, forceUpdate] = useState({});
  // const formRef = useRef<FormInstance | undefined>(initFormRef(forceUpdate, form));

  // useEffect(() => {
  //   if (!formRef.current) {
  //     formRef.current = initFormRef(forceUpdate, form);
  //   }
  //   return () => {
  //     /** 组件卸载时，清除实例 */
  //     formRef.current = undefined;
  //   }
  // }, [])

  const formRef = useRef<FormInstance>();
  const [, forceUpdate] = useState({});

  if (!formRef.current) {
    if (form) {
      formRef.current = form;
    } else {
      // Create a new FormStore if not provided
      const forceReRender = () => {
        forceUpdate({});
      };

      const formStore = new FormStore({
        forceReRender,
      });
      formRef!.current = formStore.getForm();
    }
  }
  return [formRef.current] as [FormInstance<Values>];
}
