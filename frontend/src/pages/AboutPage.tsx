import { ExternalLink, Code2, Server, Layers } from 'lucide-react';
import { Navbar } from '@/components/home/Navbar';
import { SiteFooter } from '@/components/home/SiteFooter';

const team = [
  {
    name: 'Wepngong Shalom Ngwayi Afanyu',
    role: 'Product Owner · Backend & Frontend Developer',
    image: 'https://i.imgur.com/z05WwRS.jpeg',
    github: 'https://github.com/shalom30',
    bio: 'A passionate software engineering student with a deep love for building scalable systems. Always exploring the world of software architecture.',
  },
  {
    name: 'Ateh Damaris Anyah',
    role: 'Scrum Master · Backend & Frontend Developer',
    image: 'https://i.imgur.com/TW0oWKI.jpeg',
    github: 'https://github.com/Damaris200',
    bio: 'A driven software engineering student who leads with clarity and builds with precision. Always exploring the world of software architecture.',
  },
];

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-900 text-white">
      <Navbar />
      <div className="text-center pt-32 pb-16 px-4">
        <div className="flex justify-center mb-4">
          <div className="bg-green-500/20 p-4 rounded-2xl">
            <Layers className="w-10 h-10 text-green-400" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Meet the Team</h1>
        <p className="text-green-300 text-lg max-w-2xl mx-auto">
          AgroSense AI was built by two passionate software engineering students from ICT University, Yaounde, Cameroon.
        </p>
      </div>
      <div className="max-w-5xl mx-auto px-4 pb-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        {team.map((member) => (
          <div key={member.name} className="bg-white/10 border border-white/20 rounded-3xl p-8 flex flex-col items-center text-center">
            <img src={member.image} alt={member.name} className="w-32 h-32 rounded-full object-cover border-4 border-green-400 mb-4" />
            <h2 className="text-xl font-bold mb-1">{member.name}</h2>
            <p className="text-green-400 text-sm font-medium mb-4">{member.role}</p>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">{member.bio}</p>
            <a href={member.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm">
              <ExternalLink className="w-4 h-4" />
              GitHub Profile
            </a>
          </div>
        ))}
      </div>
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <div className="bg-white/10 border border-white/20 rounded-3xl p-8 text-center">
          <div className="flex justify-center gap-4 mb-4">
            <Code2 className="w-6 h-6 text-green-400" />
            <Server className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold mb-2">AgroSense AI</h3>
          <p className="text-green-300 mb-4">Event-driven Microservices Platform for Smart Farming</p>
          <p className="text-gray-300 text-sm leading-relaxed">Built with React, Node.js, Apache Kafka, PostgreSQL, MongoDB, Docker, and Kubernetes.</p>
          <div className="mt-6">
            <a href="https://github.com/Damaris200/AgroSense_AI" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 px-6 py-3 rounded-full text-sm font-semibold">
              <ExternalLink className="w-4 h-4" />
              View on GitHub
            </a>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
