import {
  useEffect,
  useState,
} from 'react';

import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-provider';
import {
  CombinedStats,
  MonthlyStats,
  RecentRecords,
} from '@/lib/types';

export function useStats() {
	const [data, setData] = useState<CombinedStats | null>(null)
	const [loading, setLoading] = useState(true)
	const { tokens } = useAuth()
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchStats = async () => {
			setLoading(true)
			setError(null)
			const statsData = await fetchApi('/stats/combined', {}, { accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken })
			if (statsData.status === 200) {
				setData(statsData.result)
			} else {
				setError(statsData.message)
			}
		}

		fetchStats().finally(() => {
			setLoading(false)
		})
	}, [])

	const refetch = async () => {
		setLoading(true)
		setError(null)
		const statsData = await fetchApi('/stats/combined', {}, { accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken })
		if (statsData.status === 200) {
			setData(statsData.result)
		} else {
			setError(statsData.message)
		}
		setLoading(false)
	}

	return {
		data,
		loading,
		error,
		refetch,
	}
}

export function useRecentRecords() {
	const [data, setData] = useState<RecentRecords | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const { tokens } = useAuth()
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true)
			setError(null)
			const recentData = await fetchApi('/stats/recent-records', {}, { accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken })
			if (recentData.status === 200) {
				setData(recentData.result)
			} else {
				setError(recentData.message)
			}
		}

		fetchData().finally(() => {
			setLoading(false)
		})
	}, [])

	return { data, loading, error }
}

export function useMonthlyStats() {
	const [data, setData] = useState<MonthlyStats | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const { tokens } = useAuth()
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true)
			setError(null)
			const monthlyData = await fetchApi('/stats/monthly', {}, { accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken })
			if (monthlyData.status === 200) {
				setData(monthlyData.result)
			} else {
				setError(monthlyData.message)
			}
		}

		fetchData().finally(() => {
			setLoading(false)
		})
	}, [])

	return { data, loading, error }
} 