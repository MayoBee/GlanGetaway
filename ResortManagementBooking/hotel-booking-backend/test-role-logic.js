// Test the role logic to make sure it's working correctly
const testRoleLogic = () => {
  console.log('🧪 Testing Role Logic:');
  
  // Test Resort Owner
  const userRole = 'resort_owner';
  const isSuperAdmin = userRole === "admin";
  const isResortOwner = userRole === "resort_owner";
  const isAdmin = isSuperAdmin; // Only true for actual admin role
  
  console.log('\n👤 Resort Owner Test:');
  console.log(`   userRole: ${userRole}`);
  console.log(`   isSuperAdmin: ${isSuperAdmin}`);
  console.log(`   isResortOwner: ${isResortOwner}`);
  console.log(`   isAdmin: ${isAdmin}`);
  
  // Test Admin
  const adminRole = 'admin';
  const adminIsSuperAdmin = adminRole === "admin";
  const adminIsResortOwner = adminRole === "resort_owner";
  const adminIsAdmin = adminIsSuperAdmin;
  
  console.log('\n👤 Admin Test:');
  console.log(`   userRole: ${adminRole}`);
  console.log(`   isSuperAdmin: ${adminIsSuperAdmin}`);
  console.log(`   isResortOwner: ${adminIsResortOwner}`);
  console.log(`   isAdmin: ${adminIsAdmin}`);
  
  // Test Regular User
  const userRole2 = 'user';
  const userIsSuperAdmin = userRole2 === "admin";
  const userIsResortOwner = userRole2 === "resort_owner";
  const userIsAdmin = userIsSuperAdmin;
  
  console.log('\n👤 Regular User Test:');
  console.log(`   userRole: ${userRole2}`);
  console.log(`   isSuperAdmin: ${userIsSuperAdmin}`);
  console.log(`   isResortOwner: ${userIsResortOwner}`);
  console.log(`   isAdmin: ${userIsAdmin}`);
  
  console.log('\n✅ Role logic test completed');
};

testRoleLogic();
