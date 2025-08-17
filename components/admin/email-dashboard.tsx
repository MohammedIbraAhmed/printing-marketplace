'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Mail, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  TrendingUp,
  AlertCircle,
  Settings,
  BarChart,
  Loader2,
  RefreshCw
} from 'lucide-react'

interface EmailStats {
  queue: {
    total: number
    pending: number
    processing: number
    completed: number
    failed: number
    retrying: number
  }
  users: {
    total: number
    active: number
    recent: number
    roleBreakdown: Record<string, number>
  }
  unsubscribes: {
    totalUsers: number
    globalUnsubscribes: number
    preferenceBreakdown: Record<string, number>
  }
  connection: {
    success: boolean
    error?: string
  }
}

export function EmailDashboard() {
  const [stats, setStats] = useState<EmailStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = async () => {
    try {
      setRefreshing(true)
      
      const [queueRes, emailRes, unsubscribeRes, connectionRes] = await Promise.all([
        fetch('/api/admin/emails?action=queue-stats'),
        fetch('/api/admin/emails?action=email-stats'),
        fetch('/api/admin/emails?action=unsubscribe-stats'),
        fetch('/api/admin/emails?action=test-connection'),
      ])

      if (!queueRes.ok || !emailRes.ok || !unsubscribeRes.ok || !connectionRes.ok) {
        throw new Error('Failed to fetch email statistics')
      }

      const [queueData, emailData, unsubscribeData, connectionData] = await Promise.all([
        queueRes.json(),
        emailRes.json(),
        unsubscribeRes.json(),
        connectionRes.json(),
      ])

      setStats({
        queue: queueData.queue,
        users: emailData.users,
        unsubscribes: unsubscribeData.unsubscribes,
        connection: connectionData.connection,
      })
      
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load email dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading email dashboard...</span>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const getQueueHealthStatus = () => {
    if (!stats) return 'unknown'
    
    const { queue } = stats
    const failureRate = queue.total > 0 ? (queue.failed / queue.total) * 100 : 0
    
    if (!stats.connection.success) return 'error'
    if (failureRate > 10) return 'warning'
    if (queue.processing > 0 || queue.pending > 0) return 'active'
    return 'healthy'
  }

  const queueHealthStatus = getQueueHealthStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor email delivery, queue status, and user preferences
          </p>
        </div>
        <Button 
          onClick={fetchStats} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {stats && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="queue">Email Queue</TabsTrigger>
            <TabsTrigger value="users">Users & Preferences</TabsTrigger>
            <TabsTrigger value="send">Send Email</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* System Health Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Email Service</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    {stats.connection.success ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">Connected</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-600">Disconnected</span>
                      </>
                    )}
                  </div>
                  {stats.connection.error && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.connection.error}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Queue Status</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    {queueHealthStatus === 'healthy' && (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">Healthy</span>
                      </>
                    )}
                    {queueHealthStatus === 'active' && (
                      <>
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-600">Processing</span>
                      </>
                    )}
                    {queueHealthStatus === 'warning' && (
                      <>
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-yellow-600">Warning</span>
                      </>
                    )}
                    {queueHealthStatus === 'error' && (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-600">Error</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.queue.pending} pending, {stats.queue.processing} processing
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.users.total.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.users.active.toLocaleString()} active in last 30 days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unsubscribe Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.unsubscribes.totalUsers > 0 
                      ? ((stats.unsubscribes.globalUnsubscribes / stats.unsubscribes.totalUsers) * 100).toFixed(1)
                      : '0.0'
                    }%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.unsubscribes.globalUnsubscribes.toLocaleString()} global unsubscribes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Queue Summary</CardTitle>
                  <CardDescription>Current status of the email processing queue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pending</span>
                        <Badge variant="secondary">{stats.queue.pending}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Processing</span>
                        <Badge variant="default">{stats.queue.processing}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Completed</span>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          {stats.queue.completed}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Failed</span>
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                          {stats.queue.failed}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Retrying</span>
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          {stats.queue.retrying}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total</span>
                        <Badge variant="outline">{stats.queue.total}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                  <CardDescription>Users by role and activity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {Object.entries(stats.users.roleBreakdown).map(([role, count]) => (
                      <div key={role} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{role}s</span>
                        <Badge variant="outline">{count.toLocaleString()}</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">New this week</span>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        {stats.users.recent.toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="queue">
            <Card>
              <CardHeader>
                <CardTitle>Email Queue Details</CardTitle>
                <CardDescription>
                  Real-time status of email processing queue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Queue visualization would go here */}
                  <div className="text-center text-muted-foreground">
                    <BarChart className="h-12 w-12 mx-auto mb-2" />
                    <p>Queue monitoring interface coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Email Preferences</CardTitle>
                <CardDescription>
                  Overview of user subscription preferences and unsubscribe patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(stats.unsubscribes.preferenceBreakdown).map(([preference, count]) => (
                      <div key={preference} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm capitalize">
                            {preference.replace('_', ' ')}
                          </span>
                          <Badge variant="outline">{count} unsubscribed</Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-400 h-2 rounded-full" 
                            style={{ 
                              width: `${stats.unsubscribes.totalUsers > 0 
                                ? (count / stats.unsubscribes.totalUsers) * 100 
                                : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle>Send Bulk Email</CardTitle>
                <CardDescription>
                  Send announcements, maintenance notices, or other communications to users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-2" />
                  <p>Bulk email interface coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}