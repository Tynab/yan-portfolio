/* Tóm tắt: Cấu hình nội dung trung tâm cho portfolio, từ SEO đến kỹ năng, dự án và liên hệ. */

// Thiết lập website: bật/tắt splash screen mà không cần sửa router.
const settings = {
  isSplash: false, // false: "/" vào thẳng /home; đặt true để mở màn splash trước.
};

// Dữ liệu SEO cho SeoHeader: title mặc định (react-helmet-async) và url trong JSON-LD.
// description/Open Graph để tĩnh trong index.html (nhớ cập nhật ở đó khi đổi greeting.subTitle).
const seo = {
  title: "Nguyen Dang Truong An (Yami An) – Technical Leader",
  // Tên thương hiệu ngắn, dùng làm hậu tố tiêu đề trang con ("<Trang> | Yami An").
  brand: "Yami An",
  og: {
    // Domain thật của site: yamiannephilim.com/* bị Cloudflare worker chuyển hướng (xem cloudflare/).
    url: "https://portfolio.yamiannephilim.com/",
  },
};

// Nội dung hero trang chủ và các link hồ sơ chính.
const greeting = {
  title: "Nguyen Dang Truong An",
  logo_name: "yamiannephilim",
  nickname: "Yami An",
  subTitle:
    "Technical Leader in software architecture, full-stack development (.NET, Spring, React), cloud and DevOps (AWS, Kubernetes), and AI/data solutions.",
  resumeLink:
    "https://drive.google.com/file/d/1JWoXHF78fXxbPtxaJqgELhQ28aLLwsBx/view?usp=sharing",
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
    name: "Email",
    link: "mailto:yamiannephilim@gmail.com",
    fontAwesomeIcon: "fa-google", // Reference https://fontawesome.com/icons/google?style=brands
    backgroundColor: "#D14836", // Reference https://simpleicons.org/?q=gmail
  },
  {
    name: "X (Twitter)",
    link: "https://x.com/yamiannephilim",
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
        "Building offline LLM, RAG, and multi-agent applications with LangChain, LangGraph, Ollama, Qdrant, and Neo4j",
        "Cleaning, analyzing, and modeling data with Python, Pandas, TensorFlow, Keras, and PyTorch",
        "Tracking, serving, and scaling models with MLflow, Seldon Core, and Ray, grounded in statistics and machine learning fundamentals",
      ],
      softwareSkills: [
        {
          skillName: "Anaconda",
          imageSrc: "Anaconda.webp",
        },
        {
          skillName: "Jupyter Notebook",
          imageSrc: "JupyterNotebook.webp",
        },
        {
          skillName: "TensorFlow",
          imageSrc: "TensorFlow.webp",
        },
        {
          skillName: "PyTorch",
          imageSrc: "PyTorch.webp",
        },
        {
          skillName: "Ray",
          imageSrc: "Ray.webp",
        },
        {
          skillName: "RLlib",
          imageSrc: "RLlib.webp",
        },
        {
          skillName: "Hugging Face",
          imageSrc: "HuggingFace.webp",
        },
        {
          skillName: "LangChain",
          imageSrc: "LangChain.webp",
        },
        {
          skillName: "LangGraph",
          imageSrc: "LangGraph.webp",
        },
        {
          skillName: "MLflow",
          imageSrc: "MLflow.webp",
        },
        {
          skillName: "Seldon Core",
          imageSrc: "SeldonCore.webp",
        },
        {
          skillName: "Ollama",
          imageSrc: "Ollama.webp",
        },
        {
          skillName: "Groq",
          imageSrc: "Groq.webp",
        },
        {
          skillName: "Open WebUI",
          imageSrc: "OpenWebUI.webp",
        },
        {
          skillName: "ComfyUI",
          imageSrc: "ComfyUI.webp",
        },
        {
          skillName: "Claude",
          imageSrc: "Claude.webp",
        },
        {
          skillName: "OpenAI Codex",
          imageSrc: "Codex.webp",
        },
        {
          skillName: "GitHub Copilot",
          imageSrc: "Copilot.webp",
        },
        {
          skillName: "Cursor",
          imageSrc: "Cursor.webp",
        },
        {
          skillName: "Cline",
          imageSrc: "Cline.webp",
        },
        {
          skillName: "Qdrant",
          imageSrc: "Qdrant.webp",
        },
        {
          skillName: "Neo4j",
          imageSrc: "Neo4j.webp",
        },
        {
          skillName: "Elastic Stack",
          imageSrc: "Elastic.webp",
        },
        {
          skillName: "ClickHouse",
          imageSrc: "ClickHouse.webp",
        },
        {
          skillName: "Snowflake",
          imageSrc: "Snowflake.webp",
        },
        {
          skillName: "Superset",
          imageSrc: "Superset.webp",
        },
      ],
    },
    {
      title: "Full-Stack Development",
      fileName: "FullStackImg",
      skills: [
        "Designing and building back-end services and APIs with .NET, ABP, Spring, and NestJS",
        "Building web front ends with React, Next.js, Angular, and Blazor in TypeScript",
        "Modeling data with PostgreSQL, MySQL, SQL Server, MongoDB, and Redis, and building mobile apps with Swift, Android SDK, and .NET MAUI",
      ],
      softwareSkills: [
        {
          skillName: "HTML",
          imageSrc: "HTML.webp",
        },
        {
          skillName: "CSS",
          imageSrc: "CSS.webp",
        },
        {
          skillName: "JavaScript",
          imageSrc: "JS.webp",
        },
        {
          skillName: "TypeScript",
          imageSrc: "TypeScript.webp",
        },
        {
          skillName: "React",
          imageSrc: "React.webp",
        },
        {
          skillName: "Bootstrap",
          imageSrc: "Bootstrap.webp",
        },
        {
          skillName: "Angular",
          imageSrc: "Angular.webp",
        },
        {
          skillName: "Next.js",
          imageSrc: "NextJS.webp",
        },
        {
          skillName: "Blazor",
          imageSrc: "Blazor.webp",
        },
        {
          skillName: "Node.js",
          imageSrc: "Nodejs.webp",
        },
        {
          skillName: "NestJS",
          imageSrc: "NestJS.webp",
        },
        {
          skillName: ".NET",
          imageSrc: "dotNet.webp",
        },
        {
          skillName: "ABP Framework",
          imageSrc: "ABP.webp",
        },
        {
          skillName: "Spring",
          imageSrc: "Spring.webp",
        },
        {
          skillName: "Thymeleaf",
          imageSrc: "Thymeleaf.webp",
        },
        {
          skillName: "OpenAPI",
          imageSrc: "OpenAPI.webp",
        },
        {
          skillName: "AsyncAPI",
          imageSrc: "AsyncAPI.webp",
        },
        {
          skillName: "SignalR",
          imageSrc: "SignalR.webp",
        },
        {
          skillName: "Hangfire",
          imageSrc: "Hangfire.webp",
        },
        {
          skillName: "Cimetrix CIMControlFramework",
          imageSrc: "CCF.webp",
        },
        {
          skillName: "C",
          imageSrc: "C.webp",
        },
        {
          skillName: "C++",
          imageSrc: "CPP.webp",
        },
        {
          skillName: "C#",
          imageSrc: "CS.webp",
        },
        {
          skillName: "Java",
          imageSrc: "Java.webp",
        },
        {
          skillName: "Go",
          imageSrc: "Go.webp",
        },
        {
          skillName: "Rust",
          imageSrc: "Rust.webp",
        },
        {
          skillName: "Python",
          imageSrc: "Python.webp",
        },
        {
          skillName: "Lua",
          imageSrc: "Lua.webp",
        },
        {
          skillName: "Visual Basic",
          imageSrc: "VB.webp",
        },
        {
          skillName: "Swift",
          imageSrc: "Swift.webp",
        },
        {
          skillName: "Objective-C",
          imageSrc: "ObjectiveC.webp",
        },
        {
          skillName: "Android SDK",
          imageSrc: "Android.webp",
        },
        {
          skillName: "Xamarin",
          imageSrc: "Xamarin.webp",
        },
        {
          skillName: ".NET MAUI",
          imageSrc: "MAUI.webp",
        },
        {
          skillName: "Realm",
          imageSrc: "Realm.webp",
        },
        {
          skillName: "PostgreSQL",
          imageSrc: "Postgre.webp",
        },
        {
          skillName: "MySQL",
          imageSrc: "MySQL.webp",
        },
        {
          skillName: "Microsoft SQL Server",
          imageSrc: "MSSS.webp",
        },
        {
          skillName: "SQLite",
          imageSrc: "SqLite.webp",
        },
        {
          skillName: "Supabase",
          imageSrc: "Supabase.webp",
        },
        {
          skillName: "MongoDB",
          imageSrc: "MongoDb.webp",
        },
        {
          skillName: "Redis",
          imageSrc: "Redis.webp",
        },
        {
          skillName: "n8n",
          imageSrc: "n8n.webp",
        },
      ],
    },
    {
      title: "Cloud Infrastructure & DevOps",
      fileName: "CloudInfraImg",
      skills: [
        "Designing and running cloud solutions on AWS, Microsoft Azure, Google Cloud, Cloudflare, and Heroku",
        "Containerizing and orchestrating services with Docker, Kubernetes, and Helm",
        "Automating CI/CD and infrastructure with Jenkins, Argo CD, Terraform, and Ansible",
        "Monitoring and securing systems with OpenTelemetry, Prometheus, Grafana, Wazuh, and Keycloak",
      ],
      softwareSkills: [
        {
          skillName: "Amazon Web Services",
          imageSrc: "AWS.webp",
        },
        {
          skillName: "Microsoft Azure",
          imageSrc: "Azure.webp",
        },
        {
          skillName: "Google Cloud",
          imageSrc: "Google.webp",
        },
        {
          skillName: "Cloudflare",
          imageSrc: "Cloudflare.webp",
        },
        {
          skillName: "Heroku",
          imageSrc: "Heroku.webp",
        },
        {
          skillName: "Docker",
          imageSrc: "Docker.webp",
        },
        {
          skillName: "Docker Compose",
          imageSrc: "DockerCompose.webp",
        },
        {
          skillName: "Docker Swarm",
          imageSrc: "DockerSwarm.webp",
        },
        {
          skillName: "Podman",
          imageSrc: "Podman.webp",
        },
        {
          skillName: "Kubernetes",
          imageSrc: "K8s.webp",
        },
        {
          skillName: "K3s",
          imageSrc: "K3s.webp",
        },
        {
          skillName: "minikube",
          imageSrc: "Minikube.webp",
        },
        {
          skillName: "K9s",
          imageSrc: "K9s.webp",
        },
        {
          skillName: "Velero",
          imageSrc: "Velero.webp",
        },
        {
          skillName: "Helm",
          imageSrc: "Helm.webp",
        },
        {
          skillName: "KEDA",
          imageSrc: "KEDA.webp",
        },
        {
          skillName: "Jenkins",
          imageSrc: "Jenkins.webp",
        },
        {
          skillName: "Argo CD",
          imageSrc: "Argo.webp",
        },
        {
          skillName: "Terraform",
          imageSrc: "Terraform.webp",
        },
        {
          skillName: "Ansible",
          imageSrc: "Ansible.webp",
        },
        {
          skillName: "Vagrant",
          imageSrc: "Vagrant.webp",
        },
        {
          skillName: "Portainer",
          imageSrc: "Portainer.webp",
        },
        {
          skillName: "Watchtower",
          imageSrc: "Watchtower.webp",
        },
        {
          skillName: "OpenTelemetry",
          imageSrc: "OpenTelemetry.webp",
        },
        {
          skillName: "Prometheus",
          imageSrc: "Prometheus.webp",
        },
        {
          skillName: "Grafana",
          imageSrc: "Grafana.webp",
        },
        {
          skillName: "Zabbix",
          imageSrc: "Zabbix.webp",
        },
        {
          skillName: "Wazuh",
          imageSrc: "Wazuh.webp",
        },
        {
          skillName: "Kyverno",
          imageSrc: "Kyverno.webp",
        },
        {
          skillName: "Keycloak",
          imageSrc: "Keycloak.webp",
        },
        {
          skillName: "Project Calico",
          imageSrc: "Calico.webp",
        },
        {
          skillName: "Kong Gateway",
          imageSrc: "Kong.webp",
        },
        {
          skillName: "Konga",
          imageSrc: "Konga.webp",
        },
        {
          skillName: "NGINX",
          imageSrc: "NGINX.webp",
        },
        {
          skillName: "NGINX Proxy Manager",
          imageSrc: "NGINXProxyManager.webp",
        },
        {
          skillName: "ngrok",
          imageSrc: "ngrok.webp",
        },
        {
          skillName: "Apache",
          imageSrc: "Apache.webp",
        },
        {
          skillName: "MinIO",
          imageSrc: "MinIO.webp",
        },
        {
          skillName: "RabbitMQ",
          imageSrc: "RabbitMq.webp",
        },
        {
          skillName: "Git",
          imageSrc: "Git.webp",
        },
        {
          skillName: "Git LFS",
          imageSrc: "LFS.webp",
        },
        {
          skillName: "GitHub",
          imageSrc: "GitHub.webp",
        },
        {
          skillName: "GitLab",
          imageSrc: "GitLab.webp",
        },
        {
          skillName: "npm",
          imageSrc: "npm.webp",
        },
        {
          skillName: "NuGet",
          imageSrc: "NuGet.webp",
        },
        {
          skillName: "Atlassian Jira & Confluence",
          imageSrc: "Atlassian.webp",
        },
        {
          skillName: "Jam.dev",
          imageSrc: "JamDev.webp",
        },
      ],
    },
    {
      title: "Game Development & Design",
      fileName: "DesignImg",
      skills: [
        "Built several small games with Unity and Pygame, including Animal Chess with a minimax and TensorFlow-trained AI opponent",
        "Prototyping gameplay in Unity and Godot, and running multiplayer back ends with Open Match matchmaking and Agones game servers on Kubernetes",
        "Designing UI/UX and 3D assets with Figma, Adobe Creative Cloud, and Blender, and generating 3D models with AI tools such as Tripo and Meshy",
      ],
      softwareSkills: [
        {
          skillName: "Unity",
          imageSrc: "Unity.webp",
        },
        {
          skillName: "Godot",
          imageSrc: "Godot.webp",
        },
        {
          skillName: "Open Match",
          imageSrc: "OpenMatch.webp",
        },
        {
          skillName: "Agones",
          imageSrc: "Agones.webp",
        },
        {
          skillName: "Blender",
          imageSrc: "Blender.webp",
        },
        {
          skillName: "Tripo AI",
          imageSrc: "Tripo3D.webp",
        },
        {
          skillName: "Meshy",
          imageSrc: "Meshy.webp",
        },
        {
          skillName: "Adobe Creative Cloud",
          imageSrc: "Adobe.webp",
        },
        {
          skillName: "Figma",
          imageSrc: "Figma.webp",
        },
        {
          skillName: "draw.io",
          imageSrc: "drawio.webp",
        },
      ],
    },
  ],
};

// Certifications Page
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
      siteName: "Google Cloud Skills Boost",
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
      siteName: "CodeChef",
      iconifyClassname: "simple-icons:codechef",
      style: {
        color: "#5B4638",
      },
      profileLink: "https://www.codechef.com/users/yamiannephilim",
    },
    {
      siteName: "HackerEarth",
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

const certifications = {
  certifications: [
    // Core Web / Programming Languages
    {
      title: "HTML",
      subtitle: "TestCenter · Top 20% of test-takers",
      logo_path: "testcenter.png",
      certificate_link:
        "https://certificate.testcenter.vn/dUd-Vz0fMlcZNV9GVjE2bFN7SXU",
      alt_name: "TestCenter – HTML",
      color_code: "#FFB86C",
    },
    {
      title: "JavaScript",
      subtitle: "HackerRank · Intermediate",
      logo_path: "hackerrank.png",
      certificate_link: "https://www.hackerrank.com/certificates/9136c4f105da",
      alt_name: "HackerRank – JavaScript",
      color_code: "#FFE66D",
    },
    {
      title: "Python",
      subtitle: "HackerRank · Basic",
      logo_path: "hackerrank.png",
      certificate_link: "https://www.hackerrank.com/certificates/923b39aff6b7",
      alt_name: "HackerRank – Python",
      color_code: "#6EC6FF",
    },
    {
      title: "Java",
      subtitle: "HackerRank · Basic",
      logo_path: "hackerrank.png",
      certificate_link: "https://www.hackerrank.com/certificates/18b8b69e9e0f",
      alt_name: "HackerRank – Java",
      color_code: "#FF6B6B",
    },
    {
      title: "C#",
      subtitle: "HackerRank · Basic",
      logo_path: "hackerrank.png",
      certificate_link: "https://www.hackerrank.com/certificates/6f13753d7cc6",
      alt_name: "HackerRank – C#",
      color_code: "#9B5DE5",
    },
    {
      title: "PHP",
      subtitle: "TestCenter · Top 20% of test-takers",
      logo_path: "testcenter.png",
      certificate_link:
        "https://certificate.testcenter.vn/ekZ-Vz0fMlcZNV9GVjE2bFN7SXU",
      alt_name: "TestCenter – PHP",
      color_code: "#C77DFF",
    },
    {
      title: "Go",
      subtitle: "HackerRank · Intermediate",
      logo_path: "hackerrank.png",
      certificate_link: "https://www.hackerrank.com/certificates/fe8553df0712",
      alt_name: "HackerRank – Go",
      color_code: "#00C2FF",
    },

    // Frontend / UI / CMS
    {
      title: "Frontend Developer (React)",
      subtitle: "HackerRank · Role certification",
      logo_path: "hackerrank.png",
      certificate_link: "https://www.hackerrank.com/certificates/4ad345e70e8d",
      alt_name: "HackerRank – Frontend Developer (React)",
      color_code: "#61DAFB",
    },
    {
      title: "Figma Prototyping",
      subtitle: "Udemy · Course completion",
      logo_path: "udemy.png",
      certificate_link:
        "https://www.udemy.com/certificate/UC-1a6a9e4d-d01a-4515-a1bd-281e7283c34c/",
      alt_name: "Udemy – Figma Prototyping",
      color_code: "#F24E1E",
    },
    {
      title: "WordPress",
      subtitle: "TestCenter · Top 20% of test-takers",
      logo_path: "testcenter.png",
      certificate_link:
        "https://certificate.testcenter.vn/dEB_Vj0fMlcZNV9GVjE2bFN7SXU",
      alt_name: "TestCenter – WordPress",
      color_code: "#21759B",
    },

    // Backend / API / Software Engineering
    {
      title: "Java Spring MVC",
      subtitle: "CyberSoft Academy · Grade: Very Good",
      logo_path: "cybersoft.png",
      certificate_link:
        "https://drive.google.com/file/d/10JSIUge0uaZv09QnLi13nMMEI8js1xl-/view?usp=drive_link",
      alt_name: "CyberSoft Academy – Java Spring MVC",
      color_code: "#6DB33F",
    },
    {
      title: "REST API",
      subtitle: "HackerRank · Intermediate",
      logo_path: "hackerrank.png",
      certificate_link: "https://www.hackerrank.com/certificates/51c373908367",
      alt_name: "HackerRank – REST API",
      color_code: "#FF4D6D",
    },
    {
      title: "Software Engineer Role",
      subtitle: "HackerRank · Problem Solving, SQL, REST APIs",
      logo_path: "hackerrank.png",
      certificate_link: "https://www.hackerrank.com/certificates/21f4d932e858",
      alt_name: "HackerRank – Software Engineer Role",
      color_code: "#7B2CBF",
    },
    {
      title: "Problem Solving",
      subtitle: "HackerRank · Intermediate",
      logo_path: "hackerrank.png",
      certificate_link: "https://www.hackerrank.com/certificates/afa149d488a2",
      alt_name: "HackerRank – Problem Solving",
      color_code: "#FFD60A",
    },

    // Database / Data / AI
    {
      title: "SQL",
      subtitle: "HackerRank · Advanced",
      logo_path: "hackerrank.png",
      certificate_link: "https://www.hackerrank.com/certificates/9c262c7c1e37",
      alt_name: "HackerRank – SQL",
      color_code: "#F8961E",
    },
    {
      title: "MySQL",
      subtitle: "TestCenter · Top 20% of test-takers",
      logo_path: "testcenter.png",
      certificate_link:
        "https://certificate.testcenter.vn/dEB_Vz0fMlcZNV9GVjE2bFN7SXU",
      alt_name: "TestCenter – MySQL",
      color_code: "#4479A1",
    },
    {
      title: "Data Analytics with Python",
      subtitle: "CyberSoft Academy · Course completion",
      logo_path: "cybersoft.png",
      certificate_link:
        "https://drive.google.com/file/d/1-4gb3YPDXbZqzrPKO_rbRI1pVEQTQy6s/view?usp=drive_link",
      alt_name: "CyberSoft Academy – Data Analytics with Python",
      color_code: "#00B4D8",
    },
    {
      title: "Statistical Machine Learning",
      subtitle: "CyberSoft Academy · Course completion",
      logo_path: "cybersoft.png",
      certificate_link:
        "https://drive.google.com/file/d/1-H9-u_GGE_xa5Aq2Q9dpcBbhi9R00Ebw/view?usp=drive_link",
      alt_name: "CyberSoft Academy – Statistical Machine Learning",
      color_code: "#80ED99",
    },

    // DevOps / Security / Transformation
    {
      title: "Git",
      subtitle: "TestCenter · Top 20% of test-takers",
      logo_path: "testcenter.png",
      certificate_link:
        "https://certificate.testcenter.vn/dUd-Vj0fMlcZNV9GVjE2bFN7SXU",
      alt_name: "TestCenter – Git",
      color_code: "#F1502F",
    },
    {
      title: "DevOps on AWS",
      subtitle: "DevOpsEdu · Course completion",
      logo_path: "devopseduvn.png",
      certificate_link:
        "https://devopsedu.vn/certificate/?cert_hash=18b51461aaf0b6be",
      alt_name: "DevOpsEdu – DevOps on AWS",
      color_code: "#21A366",
    },
    {
      title: "Practical Kubernetes",
      subtitle: "DevOpsEdu · Course completion",
      logo_path: "devopseduvn.png",
      certificate_link:
        "https://devopsedu.vn/certificate/?cert_hash=ad4567a08148061a",
      alt_name: "DevOpsEdu – Practical Kubernetes",
      color_code: "#00F5D4",
    },
    {
      title: "Logging for DevOps",
      subtitle: "DevOpsEdu · Course completion",
      logo_path: "devopseduvn.png",
      certificate_link:
        "https://devopsedu.vn/certificate/?cert_hash=1b891b616f6076a2",
      alt_name: "DevOpsEdu – Logging for DevOps",
      color_code: "#2B579A",
    },
    {
      title: "Web Developer Security",
      subtitle: "Hacksplaining · Course completion",
      logo_path: "hacksplaining.png",
      certificate_link:
        "https://drive.google.com/file/d/1m6heXZHCLq76ABVKRukNBPL80i6uAsVA/view?usp=drive_link",
      alt_name: "Hacksplaining – Web Developer Security",
      color_code: "#9999FF",
    },
    {
      title: "Digital Transformation",
      subtitle: "FPT Corporate University · Course completion",
      logo_path: "fpt.png",
      certificate_link:
        "https://drive.google.com/file/d/1--a1O9aOZuRz6wjtQUmCSTvxRYEZBm2X/view?usp=drive_link",
      alt_name: "FPT Corporate University – Digital Transformation",
      color_code: "#FF7A00",
    },

    // Game / 3D
    {
      title: "Unity",
      subtitle: "Udemy · Course completion",
      logo_path: "udemy.png",
      certificate_link:
        "https://www.udemy.com/certificate/UC-74458ff2-07ea-4938-878c-b4382991ebea/",
      alt_name: "Udemy – Unity",
      color_code: "#A0A0A0",
    },
    {
      title: "Blender 3D",
      subtitle: "Udemy · Course completion",
      logo_path: "udemy.png",
      certificate_link:
        "https://www.udemy.com/certificate/UC-83b5cbe6-096e-4fc4-8dfa-6fb1c4278580/",
      alt_name: "Udemy – Blender 3D",
      color_code: "#F5792A",
    },

    // SEO / Office / Soft Skills / Work Process
    {
      title: "SEO",
      subtitle: "TestCenter · Top 20% of test-takers",
      logo_path: "testcenter.png",
      certificate_link:
        "https://certificate.testcenter.vn/dUR_Wj0fMlcZNV9GVjE2bFN7SXU",
      alt_name: "TestCenter – SEO",
      color_code: "#38B000",
    },
    {
      title: "Presentation",
      subtitle: "TestCenter · Top 20% of test-takers",
      logo_path: "testcenter.png",
      certificate_link:
        "https://certificate.testcenter.vn/ekZ7Vz0fMlcZNV9GVjE2bFN7SXU",
      alt_name: "TestCenter – Presentation",
      color_code: "#FFB703",
    },
    {
      title: "Agile",
      subtitle: "TestCenter · Top 20% of test-takers",
      logo_path: "testcenter.png",
      certificate_link:
        "https://certificate.testcenter.vn/dUd-VT0fMlcZNV9GVjE2bFN7SXU",
      alt_name: "TestCenter – Agile",
      color_code: "#FB5607",
    },
    {
      title: "Teamwork",
      subtitle: "TestCenter · Top 20% of test-takers",
      logo_path: "testcenter.png",
      certificate_link:
        "https://certificate.testcenter.vn/dE94Uz0fMlcZNV9GVjE2bFN7SXU",
      alt_name: "TestCenter – Teamwork",
      color_code: "#8AC926",
    },
  ],
};

// Experience Page
const experience = {
  title: "Experience",
  subtitle: "Professional Experience, Internships, and Additional Experience",
  description:
    "My experience spans education, real estate, retail, and construction technology, from leading architecture and AWS cloud delivery to maintaining large-scale retail systems and building internal management tools. I specialize in .NET, Spring, DevOps, and cloud technologies, complemented by machine learning and deep learning skills and experience mentoring and lecturing data analysis students.",
  sections: [
    {
      title: "Professional Experience",
      work: true,
      experiences: [
        {
          title: "Technical Leader",
          company: "Terralogic",
          company_url: "https://terralogic.com/",
          logo_path: "terralogic.png",
          duration: "Nov 2023 – Present",
          location: "Tan Binh, Ho Chi Minh City",
          description:
            "At Terralogic, I lead digital transformation projects in the education domain for Global Indian International School (GIIS), including its SDP, Helpdesk, Scholarship, and TMS systems. My work focuses on architectural design, data flow optimization, system integration, and AWS cloud solutions that improve administrative efficiency, school management operations, and digital interactions among educational stakeholders.",
        },
        {
          title: "Technical Leader",
          company: "Hoozing",
          company_url: "https://hoozing.com/",
          logo_path: "hoozing.png",
          duration: "Jul 2023 – Nov 2023",
          location: "Thu Duc, Ho Chi Minh City",
          description:
            "At Hoozing, I spearheaded the development of Hoozing's integrated property platform, including its customer website, agent portal, and external agent portal. I designed the architecture, improved code quality and performance, and led technical workshops for a platform that simplifies property management, marketing, buying, selling, and renting for customers, real estate agents, and external partners.",
        },
        {
          title: "Team Leader",
          company: "FPT Retail",
          company_url: "https://frt.vn/",
          logo_path: "frt.png",
          duration: "Jul 2022 – Jul 2023",
          location: "District 7, Ho Chi Minh City",
          description:
            "At FPT Retail, I led a team within a large-scale digital transformation initiative for Long Chau Pharmacy and FPT Shop. We maintained key systems, including Inventory, the POS Wrapper, and OSR, improving their stability, integration, and operational efficiency, and integrated additional systems such as OMS to move traditional retail operations onto a more scalable, unified digital platform.",
        },
        {
          title: "Team Leader",
          company: "Emar Viet Nam",
          company_url: "https://www.emar.co.jp/",
          logo_path: "emar.png",
          duration: "Jul 2017 – Jul 2022",
          location: "District 8, Ho Chi Minh City",
          description:
            "At Emar Viet Nam, within Emar Group's construction and engineering division, I led structural analysis for Japanese construction projects for clients such as Sumitomo Forestry, Mitsubishi, Odakyu, Tokyu, and Yamabiko: reviewing foundation documentation and producing technical calculations for spacer blocks, slab reinforcement areas, steel reinforcement, unit dimensions, mass inputs, and raw timber quantities. I also developed an internal HRM system, providing its architectural design, technical guidance, and code optimization to improve internal operational efficiency.",
        },
      ],
    },
    {
      title: "Internships",
      experiences: [
        {
          title: "Embedded Software Intern",
          company: "AMPM",
          company_url: "https://ampm.vn/",
          logo_path: "ampm.png",
          duration: "Jan 2017 – Mar 2017",
          location: "Tan Binh, Ho Chi Minh City",
          description:
            "At AMPM, an electronic equipment trading company, I interned in embedded software development. I gained hands-on experience developing, testing, and fine-tuning software for embedded devices, and built practical knowledge of how software interacts with electronic hardware in real-world devices.",
        },
      ],
    },
    {
      title: "Additional Experience",
      experiences: [
        {
          title: "Mentor & Lecturer",
          company: "CyberSoft Academy",
          company_url: "https://cybersoft.edu.vn/",
          logo_path: "cybersoft_academy.png",
          duration: "Jun 2023 – Jun 2024",
          location: "District 1, Ho Chi Minh City",
          description:
            "At CyberSoft Academy, I mentored data analysis students and was later invited to lecture. I taught core data analysis methods and practical techniques, and coached students in analytical thinking, data interpretation, and problem-solving.",
        },
      ],
    },
  ],
};

// Projects Page
const projectsHeader = {
  title: "Projects",
  description:
    "Selected public repositories: an offline RAG and multi-agent platform, .NET NuGet libraries, a Snowflake ID generator, a Pygame board game with AI opponents, and a data analysis dashboard.",
};

// Contact Page
const contactPageData = {
  contactSection: {
    title: "Contact Me",
    // Ảnh đại diện lấy trực tiếp từ GitHub để luôn khớp avatar hiện tại.
    profile_image_url: "https://github.com/Tynab.png?size=460",
    description:
      "Reach me through any of the channels below, or email yamiannephilim@gmail.com, to discuss software architecture, full-stack engineering, AI/data, cloud infrastructure, or DevOps work.",
  },
  blogSection: {
    title: "GitHub & Open Source",
    subtitle:
      "I publish my source code, technical notes, and project write-ups on GitHub.",
    link: greeting.githubProfile,
  },
  addressSection: {
    title: "Location",
    subtitle: "Ho Chi Minh City, Vietnam",
    locality: "Ho Chi Minh City",
    country: "VN",
    region: "Ho Chi Minh City",
    postalCode: "",
    streetAddress: "",
    location_map_link: "https://www.google.com/maps/place/Ho+Chi+Minh+City",
  },
  phoneSection: {
    title: "",
    subtitle: "",
  },
};

export {
  settings,
  seo,
  greeting,
  socialMediaLinks,
  skills,
  competitiveSites,
  certifications,
  experience,
  projectsHeader,
  contactPageData,
};
