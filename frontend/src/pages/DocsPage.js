import { Layout } from "antd";
import React from "react";
import { PageHeader } from "../components/Header";

const { Content, Footer } = Layout;
const Docs = () => {
    return (
        <Layout>
            <PageHeader/>
            <Content style={{
                padding: '0 50px',
                minHeight: '900px'
                }}
            >
                <h1>Docs us</h1>
            </Content>
            <Footer style={{ textAlign: 'center' }}>Chuong ga sap cook ©2023</Footer>
        </Layout>
    )
}

export default Docs;