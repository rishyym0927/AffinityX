"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import {
  UserActivityStats,
  WeeklyActivityData,
  RequestStatistics,
  ProfileAnalytics,
  DashboardStats,
} from "@/types/stats"

/**
 * Hook for fetching user activity statistics
 */
export function useUserStats() {
  const [stats, setStats] = useState<UserActivityStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const { data, error } = await api.getUserStats()

    if (error) {
      setError(error)
    } else if (data?.stats) {
      setStats(data.stats)
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Check if auth token exists before fetching
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (token) {
      fetchStats()
    } else {
      setIsLoading(false)
    }
  }, [fetchStats])

  return { stats, isLoading, error, refetch: fetchStats }
}

/**
 * Hook for fetching weekly activity data
 */
export function useWeeklyActivity() {
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivityData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWeeklyActivity = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const { data, error } = await api.getWeeklyActivity()

    if (error) {
      setError(error)
    } else if (data?.weekly_activity) {
      setWeeklyActivity(data.weekly_activity)
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Check if auth token exists before fetching
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (token) {
      fetchWeeklyActivity()
    } else {
      setIsLoading(false)
    }
  }, [fetchWeeklyActivity])

  return { weeklyActivity, isLoading, error, refetch: fetchWeeklyActivity }
}

/**
 * Hook for fetching request statistics
 */
export function useRequestStats() {
  const [requestStats, setRequestStats] = useState<RequestStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequestStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const { data, error } = await api.getRequestStats()

    if (error) {
      setError(error)
    } else if (data?.request_stats) {
      setRequestStats(data.request_stats)
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Check if auth token exists before fetching
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (token) {
      fetchRequestStats()
    } else {
      setIsLoading(false)
    }
  }, [fetchRequestStats])

  return { requestStats, isLoading, error, refetch: fetchRequestStats }
}

/**
 * Hook for fetching profile analytics
 */
export function useProfileAnalytics() {
  const [analytics, setAnalytics] = useState<ProfileAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const { data, error } = await api.getProfileAnalytics()

    if (error) {
      setError(error)
    } else if (data?.analytics) {
      setAnalytics(data.analytics)
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Check if auth token exists before fetching
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (token) {
      fetchAnalytics()
    } else {
      setIsLoading(false)
    }
  }, [fetchAnalytics])

  return { analytics, isLoading, error, refetch: fetchAnalytics }
}

/**
 * Hook for fetching comprehensive dashboard statistics
 * This combines all stats in a single API call for better performance
 */
export function useDashboardStats() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const { data, error } = await api.getDashboardStats()

    if (error) {
      setError(error)
    } else if (data) {
      setDashboardStats(data)
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Check if auth token exists before fetching
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (token) {
      fetchDashboardStats()
    } else {
      setIsLoading(false)
    }
  }, [fetchDashboardStats])

  return { dashboardStats, isLoading, error, refetch: fetchDashboardStats }
}
