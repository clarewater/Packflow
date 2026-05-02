import type { PackingScenario } from '@/src/types';

export const concertPackingScenarioMock: PackingScenario = {
  id: 'concert',
  name: '演唱会',
  description: '看演唱会时用于拍摄、互动和保持状态的随身清单。',
  items: [
    {
      id: 'concert-sony-camera',
      name: '索尼相机',
      note: '提前确认电量、存储空间和入场规则。',
      category: '拍摄设备',
      quantity: 1,
      isRequired: true,
      isPacked: false,
    },
    {
      id: 'concert-light-board',
      name: '荧光板',
      note: '用于现场应援。',
      category: '应援物品',
      quantity: 1,
      isRequired: false,
      isPacked: false,
    },
    {
      id: 'concert-tablet',
      name: '平板',
      note: '查看行程、票务或备份资料。',
      category: '电子设备',
      quantity: 1,
      isRequired: false,
      isPacked: false,
    },
    {
      id: 'concert-lozenges',
      name: '润喉糖',
      note: '长时间喊唱之后备用。',
      category: '护理',
      quantity: 1,
      isRequired: false,
      isPacked: false,
    },
  ],
};
