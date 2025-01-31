import React from 'react';
import { Form, Input, Space, Select, Button, DatePicker } from 'antd';
import {
    ReloadOutlined,
    CloseOutlined,
    PrinterOutlined,
    ToolOutlined,
    SearchOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    VerticalAlignBottomOutlined
} from '@ant-design/icons';

const Log = () => {
    return (
        <div style={{ padding: '16px' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: '16px' }}>
                <Space>
                    <Form.Item label="Start Date" style={{ marginBottom: 0 }}>
                        <DatePicker showTime />
                    </Form.Item>

                    <Form.Item label="End Date" style={{ marginBottom: 0 }}>
                        <DatePicker showTime />
                    </Form.Item>

                    <Form.Item label="Filter Level" style={{ marginBottom: 0 }}>
                        <Select style={{ width: 200 }} />
                    </Form.Item>

                    <Form.Item label="Number of Entries" style={{ marginBottom: 0 }}>
                        <Select style={{ width: 120 }} defaultValue="1000">
                            <Select.Option value="1000">1000</Select.Option>
                        </Select>
                    </Form.Item>
                </Space>

                <Space style={{ marginTop: '30px' }}>
                    <Button icon={<ReloadOutlined />}>Refresh</Button>
                    <Button icon={<CloseOutlined />} />
                    <Button icon={<PrinterOutlined />} />
                    <Button icon={<ToolOutlined />} />
                </Space>
            </Space>

            {/* Log Content Area */}
            <div style={{
                border: '1px solid #d9d9d9',
                borderRadius: '2px',
                padding: '16px',
                minHeight: '400px',
                background: '#fff'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>

                    <div style={{ color: '#666', padding: '20px 0' }}>
                        No events selected. Press 'Refresh' or F8 to search for log entries.
                    </div>
                </div>
            </div>
            <div style={{ marginTop: '8px', color: '#666' }}>
                <span style={{ marginRight: '8px' }}>Search for:</span>
                <Select defaultValue="Messages" style={{ width: 120, marginRight: '8px' }} />
                <Input style={{ width: 200, marginRight: '8px' }} />
                <Space>
                    <Button icon={<SearchOutlined />} />
                    <Button icon={<ArrowUpOutlined />} />
                    <Button icon={<ArrowDownOutlined />} />
                    <Button icon={<VerticalAlignBottomOutlined />} />
                    <Button icon={<VerticalAlignBottomOutlined style={{ transform: 'rotate(180deg)' }} />} />
                </Space>
            </div>

            <div style={{ marginTop: '8px', color: '#666' }}>
                Data read from Windows event log SAP_K05A
            </div>
        </div>
    );
};

export default Log;