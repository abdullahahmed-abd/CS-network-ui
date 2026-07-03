// import { useState } from 'react';
// import HeroBackground from "../src/main/HeroBackground.jpeg"
// import AuthCard from './components/AuthCard';
// import DashboardScreen from './screens/DashboardScreen';

// export default function App() {
//   const [authenticated, setAuthenticated] = useState(false);

//   if (authenticated) {
//     return (
//       <DashboardScreen onLogout={() => setAuthenticated(false)} />
//     );
//   }

//   return (
//     <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-8">
//       <HeroBackground />
//       <div className="relative z-10 w-full flex items-center justify-center">
//         <AuthCard onAuthenticated={() => setAuthenticated(true)} />
//       </div>
//     </div>
//   );
// }