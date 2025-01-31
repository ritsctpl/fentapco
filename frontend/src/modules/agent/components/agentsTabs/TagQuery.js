import React from 'react'
import { Form, Input, Select, Typography } from 'antd';

const { Text } = Typography;

const TagQuery = ({agents, handleChange}) => {
  return (
    <Form layout="vertical">
      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
        Cache Settings
      </Text>

      <Form.Item label="Cache Mode">
        <Select
          name="cacheMode"
          value={agents.cacheMode || 'Access to Cache, to Data Source as Required'}
          style={{ width: '100%' }}
          onChange={value => handleChange({ target: { name: 'cacheMode', value } })}
        >
          <Select.Option value="Access to Cache, to Data Source as Required">
            Access to Cache, to Data Source as Required
          </Select.Option>
          <Select.Option value="Access to Data Source Only">
            Access to Data Source Only
          </Select.Option>
          <Select.Option value="Access Using Aliases Only">
            Access Using Aliases Only
          </Select.Option>
          <Select.Option value="Access to Cache Only">
            Access to Cache Only
          </Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="Mask">
        <Input
          name="mask"
          value={agents.mask}
          onChange={e => handleChange({ target: { name: 'mask', value: e.target.value } })}
        />
      </Form.Item>

      <Form.Item label="Alias">
        <Input
          name="alias"
          value={agents.alias}
          onChange={e => handleChange({ target: { name: 'alias', value: e.target.value } })}
        />
      </Form.Item>
    </Form>
  )
}

export default TagQuery