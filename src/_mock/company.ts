export const COMPANY_INFO = {
    name: 'Moving Surface',
    // tagline: 'Transformation through Innovation',
    tagline:
      'Redefining memorable Events through novel interactive Solutions',
    description: "a pioneering event technology studio that excels in projection mapping, immersive experiences, and interactive solutions. Over the years, we have earned a distinguished reputation by flawlessly executing numerous high-profile projection mapping projects for renowned brands and esteemed clients.",
    work: "we pride ourselves on delivering imaginative solutions for every event. With our wealth of experience, we expertly guide our clients through the entire process - from the initial stages of ideation to the final moment of conception.Our commitment to excellence ensures that each project is crafted with precision and creativity, leaving a lasting impact on audiences and setting new standards in the events industry.",
    address: {
      location: '222, 1st Ave Efab Estate',
      state: 'Abuja',
      country: 'Nigeria',
    },
  
    contact: {
      email: 'hello@movingsurface.com.ng',
      phone: ["(+234) 803-533-5178", "(+234)814-442-2144" ],
    //   website: 'https://movingsurface.com.ng',
      website: 'https://ms-photobooth.netlify.app/',
      whatsapp: "2348035335178"
  
    },
  
    about: {
      MISSION:
        'To be the change agent for digital transformation in African business landscape',
      TIMELINE: [
        {
          color: 'info',
          bgColor: 'info',
          year: 2006,
          line: 'Established in 2006',
        },
        {
          color: 'secondary',
          bgColor: 'secondary',
          year: 2012,
          line: 'Conducted First Google Cloud Training for 5,000 NYSC members in 6 states.',
        },
        {
          color: 'success',
          bgColor: 'success',
          year: 2016,
          line: 'Pioneered the Free Google Digital Marketing Training, for 120,000 corps members across Nigeria',
        },
        {
          color: 'warning',
          bgColor: 'warning',
          year: 2019,
          line: 'Following the success report from Impact Assessment report by IPSOS (France), Google announce the commitment to train 1 million people in Africa. 350,000 individuals were trained in the period across youth and MSME demography. Delivered Lead program success story for the project',
        },
      ],
    },
    // social: {
    //   facebook: 'https://web.facebook.com/movingsurface/',
    //   twitter: 'https://twitter.com/movingsurface',
    //   // linkedin: 'https://www.linkedin.com/moving-surface',
    //   youtube: 'https://www.youtube.com/channel/UCr5pPQp8Wui_eX_XY0DXp4g/featured',
    //   vimeo: 'https://vimeo.com/user70284860',
    //   instagram: 'https://www.instagram.com/movingsurfaceng/',
    // },
    socials: [
      {
        value: 'facebook' as const,
        name: 'FaceBook',
        icon: 'eva:facebook-fill',
        color: '#1877F2',
        path: 'https://web.facebook.com/movingsurface/',
      },
      {
        value: 'instagram' as const,
        name: 'Instagram',
        icon: 'ant-design:instagram-filled',
        color: '#E02D69',
        path: 'https://www.instagram.com/movingsurfaceng/',
      },
      {
        value: 'linkedin' as const,
        name: 'Linkedin',
        icon: 'eva:linkedin-fill',
        color: '#007EBB',
        path: 'https://www.linkedin.com/in/moving-surface',
      },
      {
        value: 'twitter' as const,
        name: 'Twitter',
        icon: 'eva:twitter-fill',
        color: '#00AAEC',
        path: 'https://twitter.com/movingsurface',
      },
      {
        value: 'youtube' as const,
        name: 'YouTube',
        icon: 'ant-design:youtube-filled',
        color: '#00AAEC',
        path: 'https://www.youtube.com/channel/UCr5pPQp8Wui_eX_XY0DXp4g/featured',
      },
    ],
  
    locations: [
   
      {
        type: 'branch',
        city: 'Anambra',
        country: 'Nigeria',
        address: '2nd Floor, Ejison Filling Station, 123 Limca road, Nkpor',
        phoneNumber: '(+234)803-362-2401',
        geolocation: {
          lat: 4.847223,
          lng: 6.974604,
        },
      },
    ],
    NEWSLETTER: {
      tagline: "Be the first to know about our latest projects and events.",
      CTA: {
        label: "subscribe",
        placeHolder: "email@yourdomain.com"
      }
    }
  }