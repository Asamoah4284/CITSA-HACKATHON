"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  TrendingUp, 
  Award, 
  Share2, 
  Copy, 
  ExternalLink,
  Calendar,
  Star,
  Target,
  Activity
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

interface ReferralGroup {
  referralCode: string
  artisan: {
    _id: string
    name: string
    specialty: string
    location: string
    imageUrl: string
  }
  claims: Array<{
    id: string
    referee: {
      _id: string
      name: string
      email: string
    }
    status: string
    basePointsAwarded: number
    bonusPointsAwarded: number
    totalPointsAwarded: number
    qualityScore: number
    reasoning: string
    claimTimestamp: string
    createdAt: string
  }>
  totalPoints: number
  createdAt: string
}

interface DashboardData {
  user: {
    id: string
    name: string
    email: string
    points: number
    totalReferrals: number
    totalReferralLinks: number
  }
  referralGroups: ReferralGroup[]
  leaderboards: Array<{
    artisanId: string
    artisanName: string
    topPatrons: Array<{
      name: string
      email: string
      totalPoints: number
      referralCount: number
    }>
  }>
  userPositions: Array<{
    artisanId: string
    artisanName: string
    position: number
  }>
  orders: Array<{
    _id: string
    reference: string
    total: number
    createdAt: string
    items: Array<{
      product: {
        name: string
        imageUrl: string
        price: number
        artisan: {
          name: string
        }
      }
      quantity: number
    }>
  }>
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const { toast } = useToast()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No authentication token found')
        toast({
          title: "Authentication required",
          description: "Please log in to view your dashboard.",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('http://localhost:5000/app/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
        console.log("Dashboard data fetched successfully:", data)
      } else if (response.status === 401) {
        console.error('Authentication failed')
        toast({
          title: "Authentication failed",
          description: "Please log in again to view your dashboard.",
          variant: "destructive"
        })
      } else {
        console.error('Failed to fetch dashboard data:', response.status)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast({
        title: "Connection error",
        description: "Unable to connect to the server. Please check your internet connection.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = async (referralCode: string, artisanId: string) => {
    const link = `${window.location.origin}/entrepreneurs/${artisanId}?ref=${referralCode}`
    try {
      await navigator.clipboard.writeText(link)
      toast({
        title: "Link copied!",
        description: "Referral link has been copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive"
      })
    }
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'completed': return 'bg-blue-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  // Helper: Get unique promoted artisans from referralGroups
  const promotedArtisans = dashboardData?.referralGroups
    ? Array.from(
        new Map(
          dashboardData.referralGroups.map((group) => [group.artisan._id, group.artisan])
        ).values()
      )
    : [];

  // Helper: Prepare data for referrals over time chart
  const referralsOverTime = (() => {
    if (!dashboardData?.referralGroups) return { labels: [], data: [] };
    const dateMap: Record<string, number> = {};
    dashboardData.referralGroups.forEach((group) => {
      group.claims.forEach((claim) => {
        const date = new Date(claim.createdAt).toLocaleDateString();
        dateMap[date] = (dateMap[date] || 0) + 1;
      });
    });
    const labels = Object.keys(dateMap).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const data = labels.map((label) => dateMap[label]);
    return { labels, data };
  })();

  if (isLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please sign in to view your dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}! Here's your referral, purchase, and promotion activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.user.points || 0}</div>
            <p className="text-xs text-muted-foreground">
              Points earned from referrals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">People Referred</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.user.totalReferrals || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total successful referrals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Links</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.user.totalReferralLinks || 0}</div>
            <p className="text-xs text-muted-foreground">
              Referral links created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Quality Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.referralGroups.length ? 
                Math.round(dashboardData.referralGroups.reduce((acc, group) => 
                  acc + group.claims.reduce((sum, claim) => sum + (claim.qualityScore || 0), 0), 0
                ) / dashboardData.referralGroups.reduce((acc, group) => 
                  acc + group.claims.length, 0
                )) : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Average referral quality
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphs Section */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Referrals Over Time</CardTitle>
            <CardDescription>Track your referral activity by date</CardDescription>
          </CardHeader>
          <CardContent>
            {referralsOverTime.labels.length > 0 ? (
              <Line
                data={{
                  labels: referralsOverTime.labels,
                  datasets: [
                    {
                      label: 'Referrals',
                      data: referralsOverTime.data,
                      borderColor: '#ea580c',
                      backgroundColor: 'rgba(234,88,12,0.2)',
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
                }}
                height={80}
              />
            ) : (
              <div className="text-center text-muted-foreground py-8">No referral data yet.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Purchased Products Section */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Purchased Products</CardTitle>
            <CardDescription>All products you have purchased</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData?.orders && dashboardData.orders.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.orders.map((order) => (
                  <div key={order._id} className="border rounded-lg p-4 bg-muted/50">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <div className="font-semibold">Order Ref: {order.reference}</div>
                        <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="font-mono font-bold text-lg">${order.total.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Items:</div>
                      <ul className="list-disc pl-5">
                        {order.items.map((item: any, idx: number) => (
                          <li key={idx} className="text-sm flex items-center gap-2">
                            {item.product && (
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={item.product.imageUrl} />
                                <AvatarFallback>{getUserInitials(item.product.name)}</AvatarFallback>
                              </Avatar>
                            )}
                            {item.product?.name} x{item.quantity} - ${item.product?.price}
                            {item.product?.artisan && (
                              <span className="ml-2 text-xs text-muted-foreground">by {item.product.artisan.name}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">You have not purchased any products yet.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Promoted Artisans Section */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Artisans You Have Promoted</CardTitle>
            <CardDescription>All artisans you have referred people to</CardDescription>
          </CardHeader>
          <CardContent>
            {promotedArtisans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {promotedArtisans.map((artisan) => {
                  // Count successful referrals for this artisan
                  const count = dashboardData?.referralGroups
                    .find((g) => g.artisan._id === artisan._id)?.claims.length || 0;
                  return (
                    <div key={artisan._id} className="flex items-center gap-4 border rounded-lg p-4 bg-muted/50">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={artisan.imageUrl} />
                        <AvatarFallback>{getUserInitials(artisan.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{artisan.name}</div>
                        <div className="text-sm text-muted-foreground">{artisan.specialty}</div>
                        <div className="text-xs text-muted-foreground">{count} referrals</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">You have not promoted any artisans yet.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="referrals">My Referrals</TabsTrigger>
          <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.referralGroups.length ? (
                <div className="space-y-4">
                  {dashboardData.referralGroups.slice(0, 5).map((group) => (
                    <div key={group.referralCode} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={group.artisan.imageUrl} />
                          <AvatarFallback>{getUserInitials(group.artisan.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{group.artisan.name}</p>
                          <p className="text-sm text-muted-foreground">{group.artisan.specialty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{group.claims.length} referrals</p>
                        <p className="text-sm text-muted-foreground">{group.totalPoints} points</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No referral activity yet. Start sharing your referral links!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Performance Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
              <CardDescription>Your referral performance trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <p className="text-muted-foreground">Chart coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          {/* Referral Links */}
          <Card>
            <CardHeader>
              <CardTitle>My Referral Links</CardTitle>
              <CardDescription>
                Share these links to earn points when people join artisan circles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.referralGroups && dashboardData.referralGroups.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.referralGroups.map((group) => (
                    <div key={group.referralCode} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={group.artisan.imageUrl} />
                            <AvatarFallback>{getUserInitials(group.artisan.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{group.artisan.name}</h3>
                            <p className="text-sm text-muted-foreground">{group.artisan.specialty}</p>
                            <p className="text-xs text-muted-foreground">{group.artisan.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">{group.claims.length} total</Badge>
                          <p className="text-sm font-medium mt-1">{group.totalPoints} points</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex-1 bg-muted px-3 py-2 rounded font-mono text-sm">
                          {`${window.location.origin}/entrepreneurs/${group.artisan._id}?ref=${group.referralCode}`}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyReferralLink(group.referralCode, group.artisan._id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/entrepreneurs/${group.artisan._id}?ref=${group.referralCode}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Referral Details */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">People who used this link:</h4>
                        <div className="space-y-2">
                          {group.claims.map((claim) => (
                            <div key={claim.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                              <div className="flex items-center gap-2">
                                {claim.referee ? (
                                  <>
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback className="text-xs">
                                        {getUserInitials(claim.referee.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{claim.referee.name}</span>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${getStatusColor(claim.status)}`}
                                    >
                                      {claim.status}
                                    </Badge>
                                  </>
                                ) : (
                                  <>
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback className="text-xs">?</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm italic text-muted-foreground">Unclaimed</span>
                                    <Badge variant="secondary" className="text-xs bg-yellow-400 text-black">Unclaimed</Badge>
                                  </>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">{claim.totalPointsAwarded} pts</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(claim.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No referral links yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by joining artisan circles to generate your first referral links.
                  </p>
                  <Button onClick={() => window.location.href = '/cart'}>
                    Browse Artisans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboards" className="space-y-6">
          {/* Leaderboards */}
          <Card>
            <CardHeader>
              <CardTitle>Leaderboards</CardTitle>
              <CardDescription>Your ranking among top promoters for each artisan</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.userPositions.length ? (
                <div className="space-y-6">
                  {dashboardData.userPositions.map((position) => (
                    <div key={position.artisanId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{position.artisanName}</h3>
                        <Badge variant={position.position <= 3 ? "default" : "secondary"}>
                          #{position.position} Rank
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {dashboardData.leaderboards
                          .find(lb => lb.artisanId === position.artisanId)
                          ?.topPatrons.slice(0, 5)
                          .map((patron, index) => (
                            <div key={patron.email} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-sm">#{index + 1}</span>
                                <div>
                                  <p className="text-sm font-medium">{patron.name}</p>
                                  <p className="text-xs text-muted-foreground">{patron.referralCount} referrals</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">{patron.totalPoints} pts</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No leaderboard data available yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
