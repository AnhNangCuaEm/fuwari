import { query, RowDataPacket } from './db';

export interface DashboardStats {
  // Overview
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;

  // Order status breakdown
  ordersByStatus: {
    status: string;
    count: number;
  }[];

  // Revenue last 7 days
  revenueByDay: {
    date: string;
    revenue: number;
    orders: number;
  }[];

  // Top selling products (by order count)
  topProducts: {
    name: string;
    engName: string;
    totalSold: number;
    revenue: number;
    image: string;
  }[];

  // Low stock products
  lowStockProducts: {
    id: number;
    name: string;
    engName: string;
    quantity: number;
    image: string;
  }[];

  // Recent orders
  recentOrders: {
    id: string;
    customerEmail: string;
    total: number;
    status: string;
    createdAt: string;
  }[];

  // New users (last 7 days)
  newUsersCount: number;

  // Pending contacts
  pendingContacts: number;

  // Monthly revenue (current vs previous)
  currentMonthRevenue: number;
  previousMonthRevenue: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [
      overviewResult,
      ordersByStatusResult,
      revenueByDayResult,
      topProductsResult,
      lowStockResult,
      recentOrdersResult,
      newUsersResult,
      pendingContactsResult,
      monthlyRevenueResult,
    ] = await Promise.all([
      // Overview totals
      query<(RowDataPacket & {
        total_revenue: string;
        total_orders: string;
        total_users: string;
        total_products: string;
      })[]>(`
        SELECT
          (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status != 'cancelled') AS total_revenue,
          (SELECT COUNT(*) FROM orders) AS total_orders,
          (SELECT COUNT(*) FROM users) AS total_users,
          (SELECT COUNT(*) FROM products) AS total_products
      `),

      // Orders by status
      query<(RowDataPacket & { status: string; count: string })[]>(`
        SELECT status, COUNT(*) as count
        FROM orders
        GROUP BY status
        ORDER BY count DESC
      `),

      // Revenue by day (last 7 days)
      query<(RowDataPacket & { date: string; revenue: string; orders: string })[]>(`
        SELECT
          DATE("createdAt") AS date,
          COALESCE(SUM(total), 0) AS revenue,
          COUNT(*) AS orders
        FROM orders
        WHERE "createdAt" >= NOW() - INTERVAL '7 days'
          AND status != 'cancelled'
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `),

      // Top products from order items JSON
      query<(RowDataPacket & { name: string; eng_name: string; total_sold: string; revenue: string; image: string })[]>(`
        SELECT
          p.name,
          p."engName" AS eng_name,
          p.image,
          SUM((item->>'quantity')::int) AS total_sold,
          SUM((item->>'quantity')::int * (item->>'price')::numeric) AS revenue
        FROM orders o,
             jsonb_array_elements(o.items::jsonb) AS item
        JOIN products p ON p.id = (item->>'id')::int
        WHERE o.status != 'cancelled'
        GROUP BY p.id, p.name, p."engName", p.image
        ORDER BY total_sold DESC
        LIMIT 5
      `),

      // Low stock products (quantity <= 5)
      query<(RowDataPacket & { id: number; name: string; engName: string; quantity: number; image: string })[]>(`
        SELECT id, name, "engName", quantity, image
        FROM products
        WHERE quantity <= 5
        ORDER BY quantity ASC
        LIMIT 8
      `),

      // Recent orders (last 10)
      query<(RowDataPacket & { id: string; customerEmail: string; total: number; status: string; createdAt: string })[]>(`
        SELECT id, "customerEmail", total, status, "createdAt"
        FROM orders
        ORDER BY "createdAt" DESC
        LIMIT 10
      `),

      // New users in last 7 days
      query<(RowDataPacket & { count: string })[]>(`
        SELECT COUNT(*) AS count
        FROM users
        WHERE "createdAt" >= NOW() - INTERVAL '7 days'
      `),

      // Pending contact messages
      query<(RowDataPacket & { count: string })[]>(`
        SELECT COUNT(*) AS count
        FROM contact_messages
        WHERE status = 'pending'
      `),

      // Monthly revenue comparison
      query<(RowDataPacket & { current_month: string; previous_month: string })[]>(`
        SELECT
          COALESCE(SUM(CASE WHEN DATE_TRUNC('month', "createdAt") = DATE_TRUNC('month', NOW()) THEN total ELSE 0 END), 0) AS current_month,
          COALESCE(SUM(CASE WHEN DATE_TRUNC('month', "createdAt") = DATE_TRUNC('month', NOW() - INTERVAL '1 month') THEN total ELSE 0 END), 0) AS previous_month
        FROM orders
        WHERE status != 'cancelled'
          AND "createdAt" >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
      `),
    ]);

    const overview = overviewResult[0];
    const monthly = monthlyRevenueResult[0];

    return {
      totalRevenue: parseFloat(overview?.total_revenue ?? '0'),
      totalOrders: parseInt(overview?.total_orders ?? '0'),
      totalUsers: parseInt(overview?.total_users ?? '0'),
      totalProducts: parseInt(overview?.total_products ?? '0'),

      ordersByStatus: ordersByStatusResult.map(r => ({
        status: r.status,
        count: parseInt(r.count),
      })),

      revenueByDay: revenueByDayResult.map(r => ({
        date: r.date,
        revenue: parseFloat(r.revenue),
        orders: parseInt(r.orders),
      })),

      topProducts: topProductsResult.map(r => ({
        name: r.name,
        engName: r.eng_name,
        totalSold: parseInt(r.total_sold),
        revenue: parseFloat(r.revenue),
        image: r.image,
      })),

      lowStockProducts: lowStockResult.map(r => ({
        id: r.id,
        name: r.name,
        engName: r.engName,
        quantity: r.quantity,
        image: r.image,
      })),

      recentOrders: recentOrdersResult.map(r => ({
        id: r.id,
        customerEmail: r.customerEmail,
        total: r.total,
        status: r.status,
        createdAt: r.createdAt,
      })),

      newUsersCount: parseInt(newUsersResult[0]?.count ?? '0'),
      pendingContacts: parseInt(pendingContactsResult[0]?.count ?? '0'),

      currentMonthRevenue: parseFloat(monthly?.current_month ?? '0'),
      previousMonthRevenue: parseFloat(monthly?.previous_month ?? '0'),
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return empty stats on error
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalUsers: 0,
      totalProducts: 0,
      ordersByStatus: [],
      revenueByDay: [],
      topProducts: [],
      lowStockProducts: [],
      recentOrders: [],
      newUsersCount: 0,
      pendingContacts: 0,
      currentMonthRevenue: 0,
      previousMonthRevenue: 0,
    };
  }
}
