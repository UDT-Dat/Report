'use client';
import { useEffect } from 'react';

export default function AuthCallbackPage() {
	useEffect(() => {
		window.location.href = 'http://localhost:3001/';
	}, []);

	return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
		<div style={{ marginBottom: '16px', fontSize: '1.2rem' }}>Redirecting, please wait...</div>
		<div style={{
			width: '40px',
			height: '40px',
			border: '4px solid #ccc',
			borderTop: '4px solid #0070f3',
			borderRadius: '50%',
			animation: 'spin 1s linear infinite'
		}} />
		<style>{`
			@keyframes spin {
				0% { transform: rotate(0deg); }
				100% { transform: rotate(360deg); }
			}
		`}</style>
	</div>;
}

