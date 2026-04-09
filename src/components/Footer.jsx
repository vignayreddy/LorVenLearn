import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Github, Youtube, Globe, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Academy',
      links: [
        { label: 'All Courses', path: '/' },
        { label: 'Learning Paths', path: '/dashboard' },
        { label: 'Certifications', path: '/dashboard' },
        { label: 'Elite Membership', path: '/signup' },
      ],
    },
    {
      title: 'Community',
      links: [
        { label: 'Discussion Board', path: '/' },
        { label: 'Problem of the Day', path: '/potd' },
        { label: 'Student Showcases', path: '/' },
        { label: 'Success Stories', path: '/' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About LorvenLearn', path: '/' },
        { label: 'Contact Support', path: '/contact' },
        { label: 'Privacy Policy', path: '/' },
        { label: 'Terms of Service', path: '/' },
      ],
    },
  ];

  return (
    <footer className="bg-zinc-950 text-zinc-400 pt-20 pb-10 border-t border-zinc-900 relative">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg shadow-orange-500/20">
                <span className="text-white font-bold text-sm tracking-widest">LL</span>
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">LORVEN<span className="text-amber-500">LEARN</span></span>
            </Link>
            <p className="text-sm font-medium leading-relaxed max-w-sm">
              Empowering the next generation of digital architects through elite-grade curriculum, real-time mentorship, and industry-standard certifications.
            </p>
            <div className="flex gap-4">
              {[
                { icon: <Linkedin />, url: 'https://www.linkedin.com/in/vignayreddy-muduganti' },
                { icon: <Github />, url: 'https://github.com/vignayreddy' },
                { icon: <Twitter />, url: '#' },
                { icon: <Instagram />, url: '#' },
                { icon: <Youtube />, url: '#' }
              ].map((item, i) => (
                <a key={i} href={item.url} target="_blank" rel="noreferrer" className="p-2.5 bg-white/5 rounded-lg hover:bg-orange-600 hover:text-white transition-all text-zinc-500">
                  <span className="w-4 h-4">{item.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-6">
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-zinc-100">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.path} className="text-[15px] font-medium hover:text-amber-500 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          <div className="flex items-center gap-6">
            <span>&copy; {currentYear} LORVENLEARN LTD.</span>
            <span className="flex items-center gap-1.5 border-l border-white/10 pl-6">
              <Globe className="w-3 h-3 text-zinc-600" /> English (Global)
            </span>
          </div>
          <div className="flex items-center gap-1.5 opacity-50">
            MADE WITH <Heart className="w-3 h-3 text-red-500 fill-red-500" /> BY DEEP LEARNING ARCHITECTS
          </div>
        </div>
      </div>
    </footer>
  );
}
