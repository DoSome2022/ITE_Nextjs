// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "ite-teacher-fold.oss-cn-hongkong.aliyuncs.com",
//         pathname: "/products/**",
//       },
//       {
//         protocol: "https",
//         hostname: "ite-teacher-fold.oss-cn-hongkong.aliyuncs.com",
//         pathname: "/special-course/**",
//       },
//       {
//         protocol: 'https',
//         hostname: 'img.youtube.com',
//         pathname: '/vi/**',
//       },
//       {
//         protocol: 'https',
//         hostname: '**.aliyuncs.com',
//       },
//       {
//         protocol: 'https',
//         hostname: 'picsum.photos',
//         port: '',
//         pathname: '/**',
//       },
//     ],
//   },

//   experimental: {
//     useLightningCSS: true,       // 🔥 加上這行
//     serverActions: {
//       bodySizeLimit: '30mb',
//     },
//   },
// };

// export default nextConfig;



/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔥 關閉 Turbopack
  turbo: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ite-teacher-fold.oss-cn-hongkong.aliyuncs.com",
        pathname: "/products/**",
      },
      {
        protocol: "https",
        hostname: "ite-teacher-fold.oss-cn-hongkong.aliyuncs.com",
        pathname: "/special-course/**",
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: '**.aliyuncs.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '30mb',
    },
  },
};

export default nextConfig;
