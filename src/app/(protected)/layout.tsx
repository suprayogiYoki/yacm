'use client'
import React, { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, Popover, theme } from 'antd';
import { Footer } from 'antd/es/layout/layout';
import SubMenu from 'antd/es/menu/SubMenu';

const { Header, Sider, Content } = Layout;

const siderStyle: React.CSSProperties = {
  overflow: 'auto',
  // height: '100vh',
  position: 'sticky',
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: 'thin',
  scrollbarGutter: 'stable',
};

const headerStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 1,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 16px',
  backgroundColor: '#fff',
  boxShadow: '8px 2px 8px 0px rgba(0, 0, 0, 0.15)',
}

const menu = (
  <Menu mode="vertical" style={{ width: 256 }} items={[
    {
      key: '1',
      icon: <UserOutlined />,
      label: 'nav 1',
      children: [
        {
          key: '1-1',
          label: 'Option 1',
        },
        {
          key: '1-2',
          label: 'Option 2',
        },
      ]
    },
    {
      key: '2',
      icon: <UserOutlined />,
      label: 'nav 2',
      children: [
        {
          key: '2-1',
          label: 'Option 2-1',
        },
        {
          key: '2-2',
          label: 'Option 2-2',
        },
      ]
    }
  ]} />
);

const App = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} style={siderStyle} theme="light" >
        <div className="demo-logo-vertical" />
        <Menu
          mode="vertical"
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              icon: <UserOutlined />,
              label: 'nav 1',
            },
            {
              key: '2',
              icon: <VideoCameraOutlined />,
              label: 'nav 2',
            },
            {
              key: '3',
              icon: <UploadOutlined />,
              label: 'nav 3',
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header className="flex justify-between" style={headerStyle}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <Popover content={menu} trigger="click" placement="bottom">
            <Button type="dashed">Nested Menu</Button>
          </Popover>
        </Header>
        <Layout>
          <Layout>
            <Content
              style={{
                margin: '24px 16px',
                padding: 24,
                minHeight: 280,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              {children}
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;