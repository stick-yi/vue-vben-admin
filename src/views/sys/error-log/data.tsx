import { Tag } from 'ant-design-vue';
import { BasicColumn } from '@/components/table/index';
import { ErrorTypeEnum } from '@/store/modules/error';
import { DescItem } from '@/components/description/index';

export function getColumns(): BasicColumn[] {
  return [
    {
      dataIndex: 'type',
      title: '类型',
      width: 80,
      customRender: (text: string) => {
        const color =
          text === ErrorTypeEnum.VUE
            ? 'green'
            : text === ErrorTypeEnum.RESOURCE
            ? 'cyan'
            : text === ErrorTypeEnum.PROMISE
            ? 'blue'
            : ErrorTypeEnum.AJAX
            ? 'red'
            : 'purple';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      dataIndex: 'url',
      title: '地址',
      width: 200,
    },
    {
      dataIndex: 'time',
      title: '时间',
      width: 160,
    },
    {
      dataIndex: 'file',
      title: '文件',
      width: 200,
    },
    {
      dataIndex: 'name',
      title: 'Name',
      width: 200,
    },
    {
      dataIndex: 'message',
      title: '错误信息',
      width: 300,
    },
    {
      dataIndex: 'stack',
      title: 'stack信息',
      width: 300,
    },
  ];
}

export function getDescSchema(): DescItem[] {
  return getColumns().map((column) => {
    return {
      field: column.dataIndex!,
      label: column.title,
    };
  });
}
