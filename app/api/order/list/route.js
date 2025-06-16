import connectDB from "@/config/db";
import Address from "@/models/Address";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    Address.collection;
    Product.collection;

    // Find orders and populate with proper error handling
    const orders = await Order.find({ userId })
      .populate({
        path: "address",
        options: { strictPopulate: false },
      })
      .populate({
        path: "items.product",
        options: { strictPopulate: false },
      })
      .lean();

    // Filter out or handle orders with missing data
    const validOrders = orders.map((order) => {
      if (order.items) {
        order.items = order.items.filter((item) => item.product !== null);
      } else {
        order.items = [];
      }

      return order;
    });

    return NextResponse.json({
      success: true,
      orders: validOrders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders. Please try again.",
      },
      { status: 500 }
    );
  }
}
