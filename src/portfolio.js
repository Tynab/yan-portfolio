/* Tóm tắt: Cấu hình nội dung trung tâm cho portfolio, từ SEO đến kỹ năng, dự án và liên hệ. */

// Thiết lập website: bật/tắt splash screen mà không cần sửa router.
const settings = {
  isSplash: false, // Change this to false if you don't want Splash screen.
};

// Dữ liệu SEO dùng bởi react-helmet và JSON-LD.
const seo = {
  title: "Yami An's Portfolio",
  description:
    "A passionate individual who always thrives to work on end to end products which develop sustainable and scalable social and technical systems to create impact.",
  og: {
    title: "Yami An Portfolio",
    type: "website",
    url: "https://yamiannephilim.com/",
  },
};

// Nội dung hero trang chủ và các link hồ sơ chính.
const greeting = {
  title: "Nguyen Dang Truong An",
  logo_name: "yamiannephilim",
  nickname: "Yami An",
  subTitle:
    "A passionate individual who always thrives to work on end to end products which develop sustainable and scalable social and technical systems to create impact.",
  resumeLink:
    "https://drive.google.com/file/d/1HqRpwMKDX9vYGbZFWkyDungwJ_pgMFe_/view?usp=sharing",
  portfolio_repository: "https://github.com/Tynab/YAN-Portfolio",
  githubProfile: "https://github.com/Tynab",
  github_repo: "https://github.com/Tynab?tab=repositories",
};

const socialMediaLinks = [
  {
    name: "GitHub",
    link: "https://github.com/Tynab",
    fontAwesomeIcon: "fa-github", // Reference https://fontawesome.com/icons/github?style=brands
    backgroundColor: "#181717", // Reference https://simpleicons.org/?q=github
  },
  {
    name: "LinkedIn",
    link: "https://www.linkedin.com/in/yamiannephilim/",
    fontAwesomeIcon: "fa-linkedin-in", // Reference https://fontawesome.com/icons/linkedin-in?style=brands
    backgroundColor: "#0077B5", // Reference https://simpleicons.org/?q=linkedin
  },
  {
    name: "Gmail",
    link: "mailto:yamiannephilim@gmail.com",
    fontAwesomeIcon: "fa-google", // Reference https://fontawesome.com/icons/google?style=brands
    backgroundColor: "#D14836", // Reference https://simpleicons.org/?q=gmail
  },
  {
    name: "X-Twitter",
    link: "https://twitter.com/yamiannephilim",
    fontAwesomeIcon: "fa-x-twitter", // Reference https://fontawesome.com/icons/x-twitter?f=brands&s=solid
    backgroundColor: "#000000", // Reference https://simpleicons.org/?q=x
  },
  {
    name: "Facebook",
    link: "https://www.facebook.com/yami.an.nephilim/",
    fontAwesomeIcon: "fa-facebook-f", // Reference https://fontawesome.com/icons/facebook-f?style=brands
    backgroundColor: "#1877F2", // Reference https://simpleicons.org/?q=facebook
  },
];

const skills = {
  data: [
    {
      title: "Data Science & AI",
      fileName: "DataScienceImg",
      skills: [
        "⚡ Experienced in data science and machine learning using Python, Pandas, Keras, and TensorFlow",
        "⚡ Expertise in data cleaning, data analysis, and machine learning modeling",
        "⚡ Strong understanding of statistical concepts and machine learning algorithms",
      ],
      softwareSkills: [
        {
          skillName: "Python",
          imageSrc: "Python.png",
        },
        {
          skillName: "Jupyter Notebook",
          imageSrc: "JupyterNotebook.png",
        },
        {
          skillName: "NumPy",
          imageSrc: "NumPy.png",
        },
        {
          skillName: "Matplotlib",
          imageSrc: "Matplotlib.png",
        },
        {
          skillName: "Pandas",
          imageSrc: "Pandas.png",
        },
        {
          skillName: "seaborn",
          imageSrc: "seaborn.png",
        },
        {
          skillName: "Plotly",
          imageSrc: "Plotly.png",
        },
        {
          skillName: "SciPy",
          imageSrc: "SciPy.png",
        },
        {
          skillName: "scikit-learn",
          imageSrc: "sklearn.png",
        },
        {
          skillName: "TensorFlow",
          imageSrc: "TensorFlow.png",
        },
        {
          skillName: "Keras",
          imageSrc: "Keras.png",
        },
        {
          skillName: "PyTorch",
          imageSrc: "PyTorch.png",
        },
      ],
    },
    {
      title: "Full Stack Development",
      fileName: "FullStackImg",
      skills: [
        "⚡ Experienced in developing full-stack web applications using .NET and Spring.",
        "⚡ Expertise in front-end technologies such as HTML, CSS, Boostrap and React",
        "⚡ Strong understanding of back-end technologies such as ASP.NET, Spring Boot, and Node.js",
      ],
      softwareSkills: [
        {
          skillName: "HTML",
          imageSrc: "HTML.png",
        },
        {
          skillName: "CSS",
          imageSrc: "CSS.png",
        },
        {
          skillName: "JavaScript",
          imageSrc: "JS.png",
        },
        {
          skillName: "jQuery",
          imageSrc: "jQuery.png",
        },
        {
          skillName: "Visual Basic",
          imageSrc: "VB.png",
        },
        {
          skillName: "C",
          imageSrc: "C.png",
        },
        {
          skillName: "C++",
          imageSrc: "CPP.png",
        },
        {
          skillName: "C#",
          imageSrc: "CS.png",
        },
        {
          skillName: "Java",
          imageSrc: "Java.png",
        },
        {
          skillName: "Thymeleaf",
          imageSrc: "Thymeleaf.png",
        },
        {
          skillName: "Bootstrap",
          imageSrc: "Bootstrap.png",
        },
        {
          skillName: "React",
          imageSrc: "React.png",
        },
        {
          skillName: "Blazor",
          imageSrc: "Blazor.png",
        },
        {
          skillName: "Angular",
          imageSrc: "Angular.png",
        },
        {
          skillName: "Xamarin",
          imageSrc: "Xamarin.png",
        },
        {
          skillName: "MAUI",
          imageSrc: "MAUI.png",
        },
        {
          skillName: "Node.js",
          imageSrc: "Nodejs.png",
        },
        {
          skillName: ".NET",
          imageSrc: "dotNet.png",
        },
        {
          skillName: "ABP",
          imageSrc: "ABP.png",
        },
        {
          skillName: "Spring",
          imageSrc: "Spring.png",
        },
        {
          skillName: "SignalR",
          imageSrc: "SignalR.png",
        },
        {
          skillName: "Hangfire",
          imageSrc: "Hangfire.png",
        },
        {
          skillName: "DotNetCore.CAP",
          imageSrc: "CAP.png",
        },
        {
          skillName: "Lombok",
          imageSrc: "Lombok.png",
        },
      ],
    },
    {
      title: "Cloud Infra-Architecture",
      fileName: "CloudInfraImg",
      skills: [
        "⚡ Experience working on multiple cloud platforms",
        "⚡ Hosting and maintaining websites on virtual machine instances along with integration of databases",
        "⚡ Setting up streaming jobs from DB to Server or vice-versa on GCP and AWS",
      ],
      softwareSkills: [
        {
          skillName: "PostgreSQL",
          imageSrc: "Postgre.png",
        },
        {
          skillName: "MySQL",
          imageSrc: "MySQL.png",
        },
        {
          skillName: "Microsoft SQL Server",
          imageSrc: "MSSS.png",
        },
        {
          skillName: "SQLite",
          imageSrc: "SqLite.png",
        },
        {
          skillName: "MongoDB",
          imageSrc: "MongoDb.png",
        },
        {
          skillName: "Redis",
          imageSrc: "Redis.png",
        },
        {
          skillName: "n8n",
          imageSrc: "n8n.png",
        },
        {
          skillName: "Argo CD",
          imageSrc: "Argo.png",
        },
        {
          skillName: "Jenkins",
          imageSrc: "Jenkins.png",
        },
        {
          skillName: "Terraform",
          imageSrc: "Terraform.png",
        },
        {
          skillName: "Ansible",
          imageSrc: "Ansible.png",
        },
        {
          skillName: "Vagrant",
          imageSrc: "Vagrant.png",
        },
        {
          skillName: "Portainer",
          imageSrc: "Portainer.png",
        },
        {
          skillName: "Ollama",
          imageSrc: "Ollama.png",
        },
        {
          skillName: "Podman",
          imageSrc: "Podman.png",
        },
        {
          skillName: "Docker",
          imageSrc: "Docker.png",
        },
        {
          skillName: "Docker Compose",
          imageSrc: "DockerCompose.png",
        },
        {
          skillName: "Docker Swarm",
          imageSrc: "DockerSwarm.png",
        },
        {
          skillName: "Minikube",
          imageSrc: "Minikube.png",
        },
        {
          skillName: "Kubernetes",
          imageSrc: "K8s.png",
        },
        {
          skillName: "Open WebUI",
          imageSrc: "OpenWebUI.png",
        },
        {
          skillName: "K9s",
          imageSrc: "K9s.png",
        },
        {
          skillName: "Prometheus",
          imageSrc: "Prometheus.png",
        },
        {
          skillName: "Grafana",
          imageSrc: "Grafana.png",
        },
        {
          skillName: "Watchtower",
          imageSrc: "Watchtower.png",
        },
        {
          skillName: "Elastic Stack",
          imageSrc: "ElasticStack.png",
        },
        {
          skillName: "Kong Gateway",
          imageSrc: "Kong.png",
        },
        {
          skillName: "Wazuh",
          imageSrc: "Wazuh.png",
        },
        {
          skillName: "Project Calico",
          imageSrc: "Calico.png",
        },
        {
          skillName: "NGINX",
          imageSrc: "NGINX.png",
        },
        {
          skillName: "NGINX Proxy Manager",
          imageSrc: "NGINXProxyManager.png",
        },
        {
          skillName: "ngrok",
          imageSrc: "ngrok.png",
        },
        {
          skillName: "RabbitMQ",
          imageSrc: "RabbitMq.png",
        },
        {
          skillName: "Apache Maven",
          imageSrc: "Maven.png",
        },
        {
          skillName: "Apache Tomcat",
          imageSrc: "Tomcat.png",
        },
        {
          skillName: "Apache Kafka",
          imageSrc: "Kafka.png",
        },
        {
          skillName: "Apache Pulsar",
          imageSrc: "Pulsar.png",
        },
        {
          skillName: "Git",
          imageSrc: "Git.png",
        },
        {
          skillName: "Git LFS",
          imageSrc: "LFS.png",
        },
        {
          skillName: "GitLab",
          imageSrc: "GitLab.png",
        },
        {
          skillName: "GitHub",
          imageSrc: "GitHub.png",
        },
        {
          skillName: "Bitbucket",
          imageSrc: "Bitbucket.png",
        },
        {
          skillName: "Azure",
          imageSrc: "Azure.png",
        },
        {
          skillName: "AWS",
          imageSrc: "AWS.png",
        },
        {
          skillName: "Google Cloud Platform",
          imageSrc: "Google.png",
        },
        {
          skillName: "Heroku",
          imageSrc: "Heroku.png",
        },
        {
          skillName: "Cloudflare",
          imageSrc: "Cloudflare.png",
        },
        {
          skillName: "NuGet",
          imageSrc: "NuGet.png",
        },
        {
          skillName: "npm",
          imageSrc: "npm.png",
        },
      ],
    },
    {
      title: "Game Development & Others",
      fileName: "DesignImg",
      skills: [
        "⚡ Developed and published multiple small-scale games using Unity and Pygame",
        "⚡ Experienced in all aspects of the game development process, from ideation and prototyping to implementation and testing",
        "⚡ Proficient in a variety of programming languages and tools, including C#, Python, and Java",
      ],
      softwareSkills: [
        {
          skillName: "Lua",
          imageSrc: "Lua.png",
        },
        {
          skillName: "Pymunk",
          imageSrc: "Pymunk.png",
        },
        {
          skillName: "Pygame",
          imageSrc: "Pygame.png",
        },
        {
          skillName: "Unity",
          imageSrc: "Unity.png",
        },
        {
          skillName: "Godot",
          imageSrc: "Godot.png",
        },
        {
          skillName: "Swift",
          imageSrc: "Swift.png",
        },
        {
          skillName: "Objective-C",
          imageSrc: "ObjectiveC.png",
        },
        {
          skillName: "Android SDK",
          imageSrc: "Android.png",
        },
        {
          skillName: "Cimetrix Control",
          imageSrc: "CCF.png",
        },
        {
          skillName: "Jira Software",
          imageSrc: "JiraSoftware.png",
        },
        {
          skillName: "Confluence",
          imageSrc: "Confluence.png",
        },
        {
          skillName: "draw.io",
          imageSrc: "drawio.png",
        },
        {
          skillName: "Figma",
          imageSrc: "Figma.png",
        },
      ],
    },
  ],
};

// Education Page
const competitiveSites = {
  competitiveSites: [
    {
      siteName: "HackerRank",
      iconifyClassname: "simple-icons:hackerrank",
      style: {
        color: "#2EC866",
      },
      profileLink: "https://www.hackerrank.com/profile/yamiannephilim",
    },
    {
      siteName: "Microsoft Learn",
      iconifyClassname: "simple-icons:microsoft",
      style: {
        color: "#5E5E5E",
      },
      profileLink: "https://learn.microsoft.com/en-us/users/yamiannephilim/",
    },
    {
      siteName: "Google Cloud",
      iconifyClassname: "simple-icons:googlecloud",
      style: {
        color: "#4285F4",
      },
      profileLink:
        "https://www.cloudskillsboost.google/public_profiles/2122f75f-895e-419c-aced-97dd687127ec",
    },
    {
      siteName: "LeetCode",
      iconifyClassname: "simple-icons:leetcode",
      style: {
        color: "#F79F1B",
      },
      profileLink: "https://leetcode.com/Tynab/",
    },
    {
      siteName: "Codechef",
      iconifyClassname: "simple-icons:codechef",
      style: {
        color: "#5B4638",
      },
      profileLink: "https://www.codechef.com/users/yamiannephilim",
    },
    {
      siteName: "Hackerearth",
      iconifyClassname: "simple-icons:hackerearth",
      style: {
        color: "#323754",
      },
      profileLink: "https://www.hackerearth.com/@yamiannephilim",
    },
    {
      siteName: "Kaggle",
      iconifyClassname: "simple-icons:kaggle",
      style: {
        color: "#20BEFF",
      },
      profileLink: "https://www.kaggle.com/yamian",
    },
  ],
};

const degrees = {
  degrees: [
    {
      title: "Indian Institute of Information Technology Kurnool",
      subtitle: "B.Tech. in Computer Engineering",
      logo_path: "iiitk_logo.png",
      alt_name: "IIITDM Kurnool",
      duration: "2016 - 2020",
      descriptions: [
        "⚡ I have studied basic software engineering subjects like DS, Algorithms, DBMS, OS, CA, AI etc.",
        "⚡ Apart from this, I have done courses on Deep Learning, Data Science, Cloud Computing and Full Stack Development.",
        "⚡ I was selected for Merit cum Means Scholarship which is given to top 10% of students in college. I have received award from respected director for consistently best performance in academics.",
      ],
      website_link: "http://iiitk.ac.in",
    },
    {
      title: "Indiana University Bloomington",
      subtitle: "M.S. in Computer Science",
      logo_path: "iu_logo.png",
      alt_name: "Indiana University Bloomington",
      duration: "2021 - 2023",
      descriptions: [
        "⚡ I have taken varity of courses related to Artificial Intelligence which correspond to Explainable AI, Graph Machine Learning, Computer Vision etc.",
        "⚡ Apart from this, I have also done research assistantship. As part of it, I have worked on creating new algorithms in Graph ML and Network Science.",
        "⚡ During my time at university, I was also associated with multimedia department. As part of it, I have worked on some documentry films and interviews.",
      ],
      website_link: "https://www.indiana.edu/",
    },
  ],
};

const certifications = {
  certifications: [
    {
      title: "HTML",
      subtitle: "Top 20%",
      logo_path: "testcenter.png",
      certificate_link:
        "https://certificate.testcenter.vn/dUd-Vz0fMlcZNV9GVjE2bFN7SXU",
      alt_name: "HTML",
      color_code: "#FEC569",
    },
    {
      title: "Java",
      subtitle: "Basic",
      logo_path: "hackerrank.png",
      certificate_link: "https://www.hackerrank.com/certificates/18b8b69e9e0f",
      alt_name: "Java",
      color_code: "#FD7C80",
    },
    {
      title: "JavaScript",
      subtitle: "Intermediate",
      logo_path: "hackerrank.png",
      certificate_link: "https://www.hackerrank.com/certificates/9136c4f105da",
      alt_name: "JS",
      color_code: "#82E4CD",
    },
    {
      title: "Python",
      subtitle: "Basic",
      logo_path: "hackerrank.png",
      certificate_link: "https://www.hackerrank.com/certificates/923b39aff6b7",
      alt_name: "Python",
      color_code: "#F5DEB5",
    },
    {
      title: "PHP",
      subtitle: "Top 20%",
      logo_path: "testcenter.png",
      certificate_link:
        "https://certificate.testcenter.vn/ekZ-Vz0fMlcZNV9GVjE2bFN7SXU",
      alt_name: "PHP",
      color_code: "#DB4FA5",
    },
    {
      title: "Go",
      subtitle: "Intermediate",
      logo_path: "hackerrank.png",
      certificate_link: "https://www.hackerrank.com/certificates/fe8553df0712",
      alt_name: "Go",
      color_code: "#F0D1CE",
    },
    {
      title: "SQL",
      subtitle: "Advanced",
      logo_path: "hackerrank.png",
      certificate_link: "https://www.hackerrank.com/certificates/9c262c7c1e37",
      alt_name: "SQL",
      color_code: "#FFC347",
    },
    {
      title: "MySQL",
      subtitle: "Top 20%",
      logo_path: "testcenter.png",
      certificate_link:
        "https://certificate.testcenter.vn/dEB_Vz0fMlcZNV9GVjE2bFN7SXU",
      alt_name: "MySQL",
      color_code: "#A47DD0",
    },
    {
      title: "Wordpress",
      subtitle: "Top 20%",
      logo_path: "testcenter.png",
      certificate_link:
        "https://certificate.testcenter.vn/dEB_Vj0fMlcZNV9GVjE2bFN7SXU",
      alt_name: "Wordpress",
      color_code: "#00E65F",
    },
    {
      title: "Frontend Developer",
      subtitle: "React",
      logo_path: "hackerrank.png",
      certificate_link: "https://www.hackerrank.com/certificates/4ad345e70e8d",
      alt_name: "React",
      color_code: "#6629FF",
    },
    {
      title: "Spring",
      subtitle: "Very Good",
      logo_path: "cybersoft.png",
      certificate_link:
        "https://drive.google.com/file/d/10JSIUge0uaZv09QnLi13nMMEI8js1xl-/view?usp=drive_link",
      alt_name: "Spring",
      color_code: "#0357D3",
    },
    {
      title: "Git",
      subtitle: "Top 20%",
      logo_path: "testcenter.png",
      certificate_link:
        "https://certificate.testcenter.vn/dUd-Vj0fMlcZNV9GVjE2bFN7SXU",
      alt_name: "Git",
      color_code: "#E69BD2",
    },
    {
      title: "Rest API",
      subtitle: "Intermediate",
      logo_path: "hackerrank.png",
      certificate_link: "https://www.hackerrank.com/certificates/51c373908367",
      alt_name: "API",
      color_code: "#FF0759",
    },
    {
      title: "DX",
      subtitle: "Digital Transformation",
      logo_path: "fpt.png",
      certificate_link:
        "https://drive.google.com/file/d/1--a1O9aOZuRz6wjtQUmCSTvxRYEZBm2X/view?usp=drive_link",
      alt_name: "DX",
      color_code: "#FF6501",
    },
    {
      title: "Problem Solving",
      subtitle: "Intermediate",
      logo_path: "hackerrank.png",
      certificate_link: "https://www.hackerrank.com/certificates/afa149d488a2",
      alt_name: "Problem Solving",
      color_code: "#FFD304",
    },
    {
      title: "Agile",
      subtitle: "Top 20%",
      logo_path: "testcenter.png",
      certificate_link:
        "https://certificate.testcenter.vn/dUd-VT0fMlcZNV9GVjE2bFN7SXU",
      alt_name: "Agile",
      color_code: "#D44CC6",
    },
    {
      title: "Teamwork",
      subtitle: "Top 20%",
      logo_path: "testcenter.png",
      certificate_link:
        "https://certificate.testcenter.vn/dE94Uz0fMlcZNV9GVjE2bFN7SXU",
      alt_name: "Teamwork",
      color_code: "#C3F148",
    },
    {
      title: "Software Engineer",
      subtitle: "It covers topics like Problem solving, SQL, and REST API.",
      logo_path: "hackerrank.png",
      certificate_link: "https://www.hackerrank.com/certificates/21f4d932e858",
      alt_name: "Software Engineer",
      color_code: "#A45CFE",
    },
    {
      title: "Presentation",
      subtitle: "Top 20%",
      logo_path: "testcenter.png",
      certificate_link:
        "https://certificate.testcenter.vn/ekZ7Vz0fMlcZNV9GVjE2bFN7SXU",
      alt_name: "Presentation",
      color_code: "#86FE92",
    },
    {
      title: "DA",
      subtitle: "Data Analyst",
      logo_path: "cybersoft.png",
      certificate_link:
        "https://drive.google.com/file/d/1-4gb3YPDXbZqzrPKO_rbRI1pVEQTQy6s/view?usp=drive_link",
      alt_name: "DA",
      color_code: "#00E2FF",
    },
    {
      title: "ML",
      subtitle: "Machine Learning",
      logo_path: "cybersoft.png",
      certificate_link:
        "https://drive.google.com/file/d/1-H9-u_GGE_xa5Aq2Q9dpcBbhi9R00Ebw/view?usp=drive_link",
      alt_name: "DA",
      color_code: "#BAEEF9",
    },
  ],
};

// Experience Page
const experience = {
  title: "Experience",
  subtitle: "Work, Internship and Volunteership",
  description:
    "My extensive tech experience spans real estate, retail, and construction tech solutions, overseeing projects in management and marketing systems. I specialize in .NET, Spring, DevOps, and cloud tech, complemented by a deep proficiency in ML and DL, enhancing my mentorship role in guiding students through advanced analytical methods at the academy.",
  header_image_path: "experience.svg",
  sections: [
    {
      title: "Work",
      work: true,
      experiences: [
        {
          title: "Technical Leader",
          company: "Terralogic",
          company_url: "https://terralogic.com/",
          logo_path: "terralogic.png",
          duration: "Nov 2023 - Now",
          location: "Tan Binh District, Ho Chi Minh City",
          description:
            "At GIIS, I led digital transformation projects in education, including the TMS, SDP, Helpdesk, Timetable, and Course management. I focused on architectural design, optimizing data flows, and implementing AWS cloud solutions to enhance administrative efficiency and educational interactions.",
          color: "#ee3c26",
        },
        {
          title: "Technical Leader",
          company: "Hoozing",
          company_url: "https://hoozing.com/",
          logo_path: "hoozing.png",
          duration: "Jul 2023 - Nov 2023",
          location: "District 2, Thu Duc City",
          description:
            "The Hoozing Integrated Platform & System encompasses a range of projects, including HzWebsite, HzAgentWebsite, and HzExternalAgent. It's designed to aid customers and real estate agents in the comprehensive management, marketing, buying, selling, and renting of real estate properties.",
          color: "#0879bf",
        },
        {
          title: "Team Leader",
          company: "FPT Retail",
          company_url: "https://frt.vn/",
          logo_path: "frt.png",
          duration: "Jul 2022 - Jul 2023",
          location: "District 7, Ho Chi Minh City",
          description:
            "As a maintainer for the Inventory, POS Wrapper, and OSR sources, I played a key role in a digital transformation project for Long Chau and FPT Shop. This involved integrating multiple streams, such as OMS, to ensure a smooth and efficient transition to a digital platform.",
          color: "#9b1578",
        },
        {
          title: "Team Leader",
          company: "Emar Viet Nam",
          company_url: "https://www.emar.co.jp/",
          logo_path: "emar.png",
          duration: "Jul 2017 - Jul 2022",
          location: "District 8, Ho Chi Minh City",
          description:
            "Conduct structural analysis, review foundational documentation for 住友林業, calculate spacer blocks for 三菱, 小田急, 東急, ヤマビコ, determine reinforcement slab areas for 住宅 and 一建, input masses for 茨城, 東北, and 峰岸, and calculate steel reinforcement and unit dimensions. Additionally, estimate the required raw timber quantity.",
          color: "#fc1f20",
        },
      ],
    },
    {
      title: "Internships",
      experiences: [
        {
          title: "Embedded Intern",
          company: "AMPM",
          company_url: "https://ampm.vn/",
          logo_path: "ampm.png",
          duration: "Jan 2017 - Mar 2017",
          location: "Tan Binh, Ho Chi Minh City",
          description:
            "As an intern at an Electronic Equipment Trading Company, my role revolves around embedded programming, delving into the intricate world of embedded systems. I actively engage in developing and fine-tuning software that powers embedded devices, gaining hands-on experience in this specialized domain within the electronics industry.",
          color: "#000000",
        },
      ],
    },
    {
      title: "Volunteerships",
      experiences: [
        {
          title: "Mentor",
          company: "CyberSoft Academy",
          company_url: "https://cybersoft.edu.vn/",
          logo_path: "cybersoft_academy.png",
          duration: "Jun 2023 - Jun 2024",
          location: "District 1, Ho Chi Minh City",
          description:
            "At the academy, my role as a Data Analysis mentor involves guiding and imparting expertise in diverse data analysis methods to students, nurturing the growth of their analytical abilities. I support their journey by sharing insights, techniques, and fostering a deeper understanding of data analysis, aiding in the refinement of their analytical prowess within the academic realm.",
          color: "#4285F4",
        },
      ],
    },
  ],
};

// Projects Page
const projectsHeader = {
  title: "Projects",
  description:
    "My projects makes use of vast variety of latest technology tools. My best experience is to create Data Science projects and deploy them to web applications using cloud infrastructure.",
  avatar_image_path: "projects_image.svg",
};

const publicationsHeader = {
  title: "Publications",
  description:
    "I have worked on and published a few research papers and publications of my own.",
  avatar_image_path: "projects_image.svg",
};

const publications = {
  data: [
    {
      id: "MDEwOlJlcG9zaXRvcnkyNDU0NjcyNzQ=",
      name: "Artificial Intelligence Paper",
      createdAt: "2020-03-06T16:26:54Z",
      description: "Paper Written on Artificial Intelligence published in xyz ",
      url:
        "https://www.andrewng.org/publications/building-high-level-features-using-large-scale-unsupervised-learning/",
    },
    {
      id: "MDEwOlJlcG9zaXRvcnkyNDU0NjcyNzi=",
      name: "Artificial Intelligence Paper",
      createdAt: "2020-03-06T16:26:54Z",
      description: "Paper Written on Artificial Intelligence published in xyz ",
      url:
        "https://www.andrewng.org/publications/building-high-level-features-using-large-scale-unsupervised-learning/",
    },
    {
      id: "MDEwOlJlcG9zaXRvcnkyNDU0NjcyNze=",
      name: "Artificial Intelligence Paper",
      createdAt: "2020-03-06T16:26:54Z",
      description: "Paper Written on Artificial Intelligence published in xyz ",
      url:
        "https://www.andrewng.org/publications/building-high-level-features-using-large-scale-unsupervised-learning/",
    },
    {
      id: "MDEwOlJlcG9zaXRvcnkyNDU0NjcyNzt=",
      name: "Artificial Intelligence Paper",
      createdAt: "2020-03-06T16:26:54Z",
      description: "Paper Written on Artificial Intelligence published in xyz ",
      url:
        "https://www.andrewng.org/publications/building-high-level-features-using-large-scale-unsupervised-learning/",
    },
    {
      id: "MDEwOlJlcG9zaXRvcnkyNDU0NjcyNzb=",
      name: "Artificial Intelligence Paper",
      createdAt: "2020-03-06T16:26:54Z",
      description: "Paper Written on Artificial Intelligence published in xyz ",
      url:
        "https://www.andrewng.org/publications/building-high-level-features-using-large-scale-unsupervised-learning/",
    },
  ],
};

// Contact Page
const contactPageData = {
  contactSection: {
    title: "Contact Me",
    profile_image_path: "animated_ashutosh.png",
    description:
      "I am available through the social profiles below for software architecture, full-stack engineering, AI/data, cloud infrastructure, and DevOps collaboration.",
  },
  blogSection: {
    title: "GitHub & Writing",
    subtitle:
      "Technical notes, source code, and project references are maintained through public profiles and repositories.",
    link: greeting.githubProfile,
    avatar_image_path: "blogs_image.svg",
  },
  addressSection: {
    title: "Location",
    subtitle: "Ho Chi Minh City, Viet Nam",
    locality: "Ho Chi Minh City",
    country: "VN",
    region: "Ho Chi Minh City",
    postalCode: "",
    streetAddress: "",
    avatar_image_path: "address_image.svg",
    location_map_link: "https://www.google.com/maps/place/Ho+Chi+Minh+City",
  },
  phoneSection: {
    title: "",
    subtitle: "",
  },
};

// Các section legacy vẫn được export để component cũ import được an toàn nếu bật lại.
const contactInfo = {
  title: "Contact Me",
  subtitle: "Reach out through email or social profiles.",
  number: "",
  email_address: "yamiannephilim@gmail.com",
};

const blogSection = {
  ...contactPageData.blogSection,
  blogs: [],
};

const talkSection = {
  title: "Talks",
  subtitle: "Technical talks and sharing sessions.",
  talks: [],
};

const podcastSection = {
  title: "Podcast",
  subtitle: "Podcast embeds can be added here when needed.",
  podcast: [],
};

const bigProjects = {
  title: "Startup Projects",
  subtitle: "Featured product initiatives.",
  projects: [],
};

const achievementSection = {
  title: "Achievements",
  subtitle: "Awards and highlighted milestones.",
  achivementsCards: [],
};

export {
  settings,
  seo,
  greeting,
  socialMediaLinks,
  skills,
  competitiveSites,
  degrees,
  certifications,
  experience,
  projectsHeader,
  publicationsHeader,
  publications,
  contactPageData,
  contactInfo,
  blogSection,
  talkSection,
  podcastSection,
  bigProjects,
  achievementSection,
};
