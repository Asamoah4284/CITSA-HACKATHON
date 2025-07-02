// Test script to simulate payment flow and verify order creation
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testPaymentFlow() {
  console.log('🧪 Testing Payment Flow...');
  
  // Test data
  const testOrderData = {
    userId: "test-user-" + Date.now(),
    items: [
      {
        productId: "test-product-123",
        quantity: 2,
        price: 25.99,
        name: "Test Product",
        entrepreneur: "Test Artisan",
        entrepreneurId: "test-artisan-123"
      }
    ],
    total: 51.98,
    reference: "test-payment-ref-" + Date.now()
  };
  
  console.log('📋 Test order data:', testOrderData);
  
  try {
    // Test order creation
    console.log('📡 Creating test order...');
    const createResponse = await fetch('http://localhost:5000/app/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testOrderData)
    });
    
    console.log('📡 Create response status:', createResponse.status);
    
    if (createResponse.ok) {
      const createdOrder = await createResponse.json();
      console.log('✅ Order created successfully:', createdOrder);
      
      // Test order retrieval
      console.log('📡 Retrieving test order...');
      const getResponse = await fetch(`http://localhost:5000/app/orders?userId=${testOrderData.userId}`);
      
      console.log('📡 Get response status:', getResponse.status);
      
      if (getResponse.ok) {
        const orders = await getResponse.json();
        console.log('✅ Orders retrieved successfully:', orders);
        console.log('📊 Number of orders found:', orders.length);
        
        if (orders.length > 0) {
          console.log('🎉 SUCCESS: Payment flow is working correctly!');
          console.log('📋 Latest order details:', orders[0]);
        } else {
          console.log('❌ FAILED: No orders found after creation');
        }
      } else {
        console.log('❌ FAILED: Could not retrieve orders');
      }
    } else {
      const errorData = await createResponse.json();
      console.log('❌ FAILED: Could not create order:', errorData);
    }
  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

// Run the test
testPaymentFlow(); 