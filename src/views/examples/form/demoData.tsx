import { FormSchema } from '@/components/form/index';
import TestComp from './TestComp.vue';
// import { Tinymce, TinymceActionType } from '@/components/tinymce/index';
// import { Ref } from 'compatible-vue';
import { UploadContainer, UploadResult } from '@/components/file/index';
const uploadDataDemo1: UploadResult = {
  id: '530000201511022928',
  name: '初始值.png',
  status: 'success',
  url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
};
export const uploadDataDemo: UploadResult = {
  id: '1234567',
  name: '设置图片.png',
  status: 'success',
  url: 'https://picsum.photos/id/66/346/216',
};
const options = [
  {
    label: '选项1',
    value: '1',
  },
  {
    label: '选项2',
    value: '2',
  },
];
export const basicSchema: FormSchema[] = [
  {
    field: 'field1',
    label: '字段1',
    component: 'Input',
    helpMessage: '字段提示',
  },
  {
    field: 'field2',
    label: '字段2',
    component: 'Input',
  },
  {
    field: 'field3',
    label: '字段3',
    component: 'Select',
    componentProps: {
      options: options,
    },
  },
  {
    field: 'field4',
    label: '字段4',
    component: 'Select',
    componentProps: {
      options: options,
    },
  },
  {
    field: 'field5',
    label: '字段5-默认值',
    component: 'DatePicker',
    defaultValue: '2020-07-20',
  },
  {
    field: 'field6',
    label: '字段6',
    component: 'DatePicker',
  },
];

export const dynamicSchema: FormSchema[] = [
  {
    field: 'field1',
    label: '字段1',
    component: 'Input',
    rules: [
      {
        required: true,
      },
    ],
    colProps: {
      span: 12,
    },
    show: ({ values }) => {
      const { field3 } = values;
      return field3;
    },
    dynamicRules: ({ values }) => {
      const { field5 } = values;
      return [
        {
          required: field5,
          message: '请输入',
        },
      ];
    },
  },
  {
    field: 'field2',
    label: '字段2',
    component: 'Input',
    rules: [
      {
        required: true,
        message: '必须输入',
      },
    ],
    colProps: {
      span: 12,
    },
    dynamicDisabled: ({ values }) => {
      const { field4 } = values;
      return field4;
    },
  },
  {
    field: 'field3',
    label: '动态显示字段1',
    component: 'Checkbox',
    defaultValue: true,
    colProps: {
      span: 8,
    },
  },
  {
    field: 'field4',
    label: '动态禁用字段2',
    component: 'Checkbox',
    defaultValue: true,
    colProps: {
      span: 8,
    },
  },
  {
    field: 'field5',
    labelWidth: 200,
    label: '动态更改字段1 必填',
    component: 'Checkbox',
    defaultValue: true,
    colProps: {
      span: 8,
    },
  },
];
export const validateSchema: FormSchema[] = [
  {
    field: 'field1',
    label: '字段1',
    component: 'Input',
    rules: [
      {
        required: true,
      },
    ],
    colProps: {
      span: 8,
    },
  },
  {
    field: 'field2',
    label: '字段2',
    component: 'Input',
    rules: [
      {
        required: true,
        message: '请输入字段2',
      },
    ],
    colProps: {
      span: 8,
    },
  },
  {
    field: 'field3',
    label: '字段3',
    component: 'Select',
    componentProps: { options },
    rules: [
      {
        required: true,
      },
    ],
    colProps: {
      span: 8,
    },
  },
];
export const customSchema: FormSchema[] = [
  {
    field: 'field1',
    label: '字段1',
    component: 'Input',

    colProps: {
      span: 12,
    },
    render: ({ values }) => {
      return <div>field2值:{values.field2}</div>;
    },
  },
  {
    field: 'field2',
    label: '字段2',
    component: 'Input',
    colProps: {
      span: 12,
    },
  },
  {
    field: 'filed3',
    labelWidth: 200,
    label: '字段3(自定义组件)',
    component: 'Input',
    colProps: {
      span: 12,
    },
    rules: [
      {
        required: true,
      },
    ],
    render: () => {
      // 自定义组件需要提供props value 和change事件
      return <TestComp />;
    },
  },
  {
    field: 'filed4',
    label: '字段4(前缀)',
    component: 'Input',
    colProps: {
      span: 12,
    },
    rules: [
      {
        required: true,
      },
    ],
    // 对应input组件的slot prefix
    renderComponentContent: () => {
      return <div slot="prefix">$</div>;
    },
  },
];
export const getAdvanceSchema = (itemNumber = 6): FormSchema[] => {
  const arr: any = [];
  for (let index = 0; index < itemNumber; index++) {
    arr.push({
      field: `field${index}`,
      label: `字段${index}`,
      component: 'Input',

      colProps: {
        xl: 12,
        xxl: 8,
      },
    });
  }
  return arr;
};

// export function setComplexSchema(tinymceElRef: Ref<TinymceActionType>): FormSchema[] {
export function setComplexSchema(): FormSchema[] {
  return [
    {
      field: 'fieldInput',
      label: '输入框',
      component: 'Input',
      defaultValue: 'defaultValue',
      rules: [
        {
          required: true,
        },
      ],
    },
    {
      field: 'fieldUpload',
      label: '上传图片',
      // slot: 'uploadImg',
      defaultValue: [uploadDataDemo1, uploadDataDemo],
      rules: [
        {
          required: true,
        },
      ],
      render: () => {
        return <UploadContainer maxSize={1} maxNumber={3} />;
      },
    },
    {
      field: 'fieldTinymce',
      label: '富文本',
      rules: [
        {
          required: true,
          message: '请输入',
        },
      ],
      defaultValue: 'defaultValue',
      slot: 'tinymce',
    },
  ];
}
