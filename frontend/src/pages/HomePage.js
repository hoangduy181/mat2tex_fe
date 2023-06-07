import React, { useEffect } from 'react';
import { Layout, Menu, theme, Tabs } from 'antd';
import '../css/HomePage.css';
import UploadAndPreview from '../components/UploadAndPreview';
import { AppContext } from '../Context';
import PredictionDisplay from '../components/PredictionDisplay';
import ResultDisplay from '../components/ResultDisplay';
import logo from '../media/LOGO.svg'
import { PageHeader } from '../components/Header';

const { Header, Content, Footer } = Layout;

const SubContent = ({ children }) => (
	<Content
          className="site-layout-background"
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
          }}
        >
          {children}
	</Content>
)

const HomePage = () => {
	const {
		token: { colorBgContainer },
	} = theme.useToken();

	const {appPhase, loading} = React.useContext(AppContext)
	const [phase, setPhase] = appPhase;
	const [isLoading] = loading;
	const [activeKey, setActiveKey] = React.useState('');

	useEffect(() => {
	if (phase === 'upload' || phase === 'preview') {
		setActiveKey('upload')
	} else if (phase === 'predict' || phase === 'edit') {
		setActiveKey('predict')
	} else if (phase === 'result') {
		setActiveKey('result')
	}}, [phase])
	
	return (
		<Layout>
			<PageHeader/>
			<Content style={{
				padding: '0 50px',
				minHeight: '900px'
				}}
			>
				<Layout style={{ padding: '24px 0', background: colorBgContainer }}>
					<Tabs
						defaultActiveKey="1"
						centered
						activeKey={activeKey}
						items = {[
							{
								key: 'upload',
								label: 'Upload',
								children: <SubContent children={<UploadAndPreview/>} />
							},
							{
								key: 'predict',
								label: 'Predict',
								children: <SubContent children={<PredictionDisplay/>} />
							},
							{
								key: 'result',
								label: 'Result',
								children: <SubContent children={<ResultDisplay/>} />
							}
						]}
					>
					</Tabs>

				</Layout>
			</Content>
			<Footer style={{ textAlign: 'center' }}>M2T ©2023</Footer>
		</Layout>
	);
};

export default HomePage;
