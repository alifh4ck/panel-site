Panel Site (USDT BEP20 Manual Verify)
এই ওয়েবসাইট দিয়ে আমি আমার প্যানেল/প্রোডাক্টগুলো লিস্ট করতে পারবো এবং কাস্টমাররা USDT (BEP20) পেমেন্ট করার পর TxID সাবমিট করতে পারবে। এরপর আমি Admin Panel থেকে অর্ডার Approve/Reject করবো।
Features
User Side
• Products/Panel list দেখা
• Checkout: Email + Transaction Hash (TxID) সাবমিট
• Wallet address + Network info দেখা
• Order Status দেখা (PENDING / PAID / REJECTED)
• Order-based messaging (customer ↔ admin)
Admin Side
• Admin panel (password protected)
• Product add/edit/delete + active toggle
• Orders list দেখা
• Approve (PAID) / Reject করা
• Order messages দেখা + reply
Payment Info
• Network: BSC (BEP20)
• Currency: Fixed USDT
• Wallet Address:  0xa5de3c79c11ffbd55f08b3a5390b7c42fb6cea50 
• Payment verification: Manual (Admin approve)
How to Use (Live)
• User site:  /index.html 
• Admin panel:  /admin.html 
• Admin password: (নিজের কাছে রাখুন)
Notes / Limitations
• এটা HTML/JS static সাইট।
• ডাটা browser localStorage এ সেভ হয়:
• যে ডিভাইসে/ব্রাউজারে admin product add করবেন, সাধারণত সেই ডিভাইসেই থাকবে।
• অন্য ফোন/PC তে একই ডাটা অটো দেখাবে না।
• Production-grade secure login/central database চাইলে backend (Next.js + database) লাগবে।
Files
•  index.html  = User site
•  admin.html  = Admin panel
•  app.js  = Core logic + localStorage store

