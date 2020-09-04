import { VNode } from 'compatible-vue';
import { Form, Col } from 'ant-design-vue';
import { BaseHelp } from '@/components/base/index';

// import { FormModelItem } from './types/formModelItem';
import { FormProps, AllItemProps, FormSchema } from './types/form';
import { ColEx, SlotType } from './types/index';
import { FieldDecoratorOptions, ValidationRule } from 'ant-design-vue/types/form/form';

import { isNumber, isBoolean, isFunction } from '@/utils/is/index';
import { getSlot } from '@/utils/helper/tsxHelper';
import { createPlaceholderMessage } from './helper';

import { componentMap } from './componentMap';

import { cloneDeep } from '@/utils/lodashChunk';
/**
 * @description: 从表单的props获取对item全局设置的属性
 */
export function getAllItemSettingByProps(props: FormProps): AllItemProps {
  const { labelWidth, wrapperCol, colon, labelAlign, labelCol } = props;
  return { labelWidth, wrapperCol, colon, labelAlign, labelCol };
}

/**
 * @description: 处理label宽度相关
 */
function handleLabel(
  schemaItem: FormSchema,
  props: FormProps
): { labelCol: Partial<ColEx>; wrapperCol: Partial<ColEx> } {
  const { labelCol = {}, wrapperCol = {} } = schemaItem.itemProps || {};
  const { labelWidth, disabledLabelWidth } = schemaItem;
  const {
    labelWidth: globalLabelWidth,
    //  wrapperCol, colon, labelAlign, labelCol
  } = getAllItemSettingByProps(props);

  // 如果全局有设置labelWidth, 则所有item使用
  if ((!globalLabelWidth && !labelWidth) || disabledLabelWidth) {
    return { labelCol, wrapperCol };
  }
  let width = labelWidth || globalLabelWidth;

  if (width) {
    width = isNumber(width) ? `${width}px` : `${width.replace('px', '')}px`;
  }
  return {
    labelCol: { style: { width }, span: 1, ...labelCol },
    wrapperCol: { style: { width: `calc(100% - ${width})` }, span: 23, ...wrapperCol },
  };
}

/**
 * @description: 处理规则校验
 */

function handleRules(
  schemaItem: FormSchema,
  props: FormProps,
  fieldsValues: any
): ValidationRule[] {
  const {
    rules: defRules = [],
    component,
    rulesMessageJoinLabel,
    label,
    dynamicRules,
  } = schemaItem;

  if (isFunction(dynamicRules)) {
    return dynamicRules({
      schema: schemaItem,
      values: fieldsValues,
      form: props.form,
    });
  }

  const rules: ValidationRule[] = cloneDeep(defRules);
  const requiredRuleIndex: number = rules.findIndex(
    (rule) => Reflect.has(rule, 'required') && !Reflect.has(rule, 'validator')
  );
  const { rulesMessageJoinLabel: globalRulesMessageJoinLabel } = props;
  if (requiredRuleIndex !== -1) {
    const rule = rules[requiredRuleIndex];
    if (rule.required && component) {
      const joinLabel = Reflect.has(schemaItem, 'rulesMessageJoinLabel')
        ? rulesMessageJoinLabel
        : globalRulesMessageJoinLabel;
      rule.message =
        rule.message || createPlaceholderMessage(component) + `${joinLabel ? label : ''}`;
      if (component.includes('Input') || component.includes('Textarea')) {
        rule.whitespace = true;
      }
      if (
        component.includes('DatePicker') ||
        component.includes('MonthPicker') ||
        component.includes('WeekPicker') ||
        component.includes('TimePicker')
      ) {
        rule.type = 'object';
      }
      if (component.includes('RangePicker')) {
        rule.type = 'array';
      }
    }
  }

  // 最大输入长度规则校验
  const characterInx = rules.findIndex((val) => val.max);
  if (characterInx !== -1 && !rules[characterInx].validator) {
    rules[characterInx].message =
      rules[characterInx].message || `字符数应小于${rules[characterInx].max}位`;
  }
  return rules;
}
/**
 * @description: 处理表单字段绑定,校验等
 */
function handleDecorator(
  schemaItem: FormSchema,
  props: FormProps,
  fieldsValues: any
): FieldDecoratorOptions {
  const { fieldDecoratorOptions, component, defaultValue } = schemaItem;
  const rules = handleRules(schemaItem, props, fieldsValues);

  let valuePropName = 'value';
  if (component && ['Switch', 'Checkbox'].includes(component)) {
    valuePropName = 'checked';
  } // const ruleList = [{ required: required, message: 'Please input your username!' }];
  return {
    rules: rules,
    valuePropName,
    initialValue: defaultValue,
    ...fieldDecoratorOptions,
  };
}
/**
 * @description: 渲染组件
 */
function renderComponent(schemaItem: FormSchema, props: FormProps, allDefaultValues: any) {
  const {
    component,
    componentProps,
    dynamicDisabled,
    componentOn,
    field,
    renderComponentContent,
  } = schemaItem;
  if (!component) {
    return;
  }
  const Comp = componentMap.get(component) as any;
  const { disabled, autoSetPlaceHolder, size } = props;

  const disabledObj: { disabled?: boolean } = {};
  if (isBoolean(dynamicDisabled)) {
    disabledObj.disabled = dynamicDisabled;
  }
  const fieldsValues = {
    ...allDefaultValues,
    ...props.form.getFieldsValue(),
  };
  if (isFunction(dynamicDisabled)) {
    disabledObj.disabled = dynamicDisabled({
      schema: schemaItem,
      values: fieldsValues,
      form: props.form,
    });
  }

  const propsData = {
    disabled: disabled,
    allowClear: true,
    getPopupContainer: (trigger: Element) => trigger.parentNode,
    size,
    ...componentProps,
    ...disabledObj,
  };

  // placeholder
  const isCreatePlaceholder = !propsData.disabled && autoSetPlaceHolder;
  let placeholder;
  // RangePicker place为数组
  if (isCreatePlaceholder && component !== 'RangePicker' && component) {
    placeholder =
      (componentProps && componentProps.placeholder) || createPlaceholderMessage(component);
  }

  return props.form.getFieldDecorator(
    field,
    handleDecorator(schemaItem, props, fieldsValues)
  )(
    <Comp
      {...{
        props: {
          codeField: field,
          ...propsData,
          formValues: fieldsValues,
        },
        ...propsData,
      }}
      placeholder={placeholder}
      on={componentOn}
    >
      {renderComponentContent
        ? isFunction(renderComponentContent)
          ? renderComponentContent({ schema: schemaItem, values: fieldsValues, form: props.form })
          : renderComponentContent
        : null}
    </Comp>
  );
}

function renderLabelHelpMessage(schemaItem: FormSchema) {
  const { label, helpMessage, helpComponentProps } = schemaItem;
  if (!helpMessage || (Array.isArray(helpMessage) && helpMessage.length === 0)) {
    return label;
  }
  return (
    <span>
      {label}
      <BaseHelp class="mx-1" text={helpMessage} {...helpComponentProps} />
    </span>
  );
}
/**
 * @description: 渲染表单项
 */
export function renderFormModelItem(
  schemaItem: FormSchema,
  props: FormProps,
  slots: SlotType,
  allDefaultValues: any
): VNode {
  const { labelCol, wrapperCol } = handleLabel(schemaItem, props);
  const { selfUpdate = true, colon } = props;
  const { itemProps, render, slot, field } = schemaItem;

  // form-item 配置项
  const formItemProps = {
    prop: field,
    selfUpdate,
    colon,
    ...itemProps,
    labelCol,
    wrapperCol,
    label: renderLabelHelpMessage(schemaItem),
  };

  const wrapComp = props.form.getFieldDecorator(
    field,
    handleDecorator(schemaItem, props, allDefaultValues)
  );
  return (
    <Form.Item props={formItemProps}>
      {slot && getSlot(slots, slot) && wrapComp(getSlot(slots, slot))}

      {!slot &&
        (render
          ? wrapComp(
              render({
                schema: schemaItem,
                values: {
                  ...allDefaultValues,
                  ...props.form.getFieldsValue(),
                },
                form: props.form,
              })
            )
          : renderComponent(schemaItem, props, allDefaultValues))}
    </Form.Item>
  );
}

/**
 * @description: 渲染列
 */
export function renderCol(
  schemaItem: FormSchema,
  props: FormProps,
  slots: SlotType,
  allDefaultValues: any
): VNode | null {
  const { colProps = {}, field, renderColContent, colSlot, show, isAdvanced } = schemaItem;

  let isShow = true;

  if (isBoolean(show)) {
    isShow = show;
  }

  if (isFunction(show)) {
    isShow = show({
      schema: schemaItem,
      values: {
        ...allDefaultValues,
        ...props.form.getFieldsValue(),
      },
      form: props.form,
    });
  }
  const { showAdvancedButton, baseColProps = {} } = props;

  const realColProps = { ...baseColProps, ...colProps };
  return isShow ? (
    <Col
      key={field}
      {...{ props: realColProps, ...realColProps }}
      v-show={showAdvancedButton ? isAdvanced : true}
    >
      {colSlot && getSlot(slots, colSlot)}
      {/*
      自定义render
      */}
      {!colSlot &&
        (renderColContent
          ? renderColContent({
              schema: schemaItem,
              values: props.form.getFieldsValue(),
              form: props.form,
            })
          : renderFormModelItem(schemaItem, props, slots, allDefaultValues))}
    </Col>
  ) : null;
}
