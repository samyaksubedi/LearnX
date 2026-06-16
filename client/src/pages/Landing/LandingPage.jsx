import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  FileText,
  FileVideo,
  FileAudio,
  ArrowRight,
  Clock,
  BookOpen,
  Zap,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroDemo = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const citations = [
    {
      label: '▶ Jump to 2:14',
      text: 'Supervised learning uses labeled training data to teach models how to make predictions.',
    },
    {
      label: '▶ Jump to 5:32',
      text: 'Neural networks mimic the brain — layers of nodes transform input into output.',
    },
    {
      label: '📄 Page 12',
      text: 'Gradient descent minimizes the loss function by iteratively adjusting weights.',
    },
  ];

  const questions = [
    'What is supervised learning?',
    'How do neural networks work?',
    'Explain gradient descent',
  ];

  return (
    <div className='relative w-full max-w-md mx-auto'>
      {/* Glow */}
      <div className='absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full scale-150 pointer-events-none' />

      {/* App window mockup */}
      <div className='relative bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50'>
        {/* Window chrome */}
        <div className='flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0d0d0d]'>
          <div className='h-2.5 w-2.5 rounded-full bg-red-500/60' />
          <div className='h-2.5 w-2.5 rounded-full bg-yellow-500/60' />
          <div className='h-2.5 w-2.5 rounded-full bg-green-500/60' />
          <span className='ml-3 text-xs text-white/20 font-mono'>
            learnx.app
          </span>
        </div>

        {/* Content */}
        <div className='p-4 space-y-3'>
          {/* Fake media bar */}
          <div className='bg-white/5 rounded-xl p-3 flex items-center gap-3 border border-white/5'>
            <div className='h-8 w-8 rounded-lg bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0'>
              <Play className='h-4 w-4 text-indigo-400' />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-xs text-white/70 font-medium truncate'>
                What is Machine Learning?
              </p>
              <div className='mt-1.5 h-1 bg-white/10 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-indigo-500 rounded-full transition-all duration-[3000ms] ease-linear'
                  style={{ width: `${(step + 1) * 30}%` }}
                />
              </div>
            </div>
            <span className='text-xs text-white/30 shrink-0'>
              {step === 0 ? '2:14' : step === 1 ? '5:32' : '8:47'}
            </span>
          </div>

          {/* Chat messages */}
          <div className='space-y-3 min-h-[200px]'>
            {/* User message */}
            <div className='flex justify-end'>
              <div className='bg-indigo-600 rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[75%]'>
                <p className='text-xs text-white leading-relaxed'>
                  {questions[step]}
                </p>
              </div>
            </div>

            {/* AI message */}
            <div className='flex flex-col items-start gap-2'>
              <div className='bg-white/5 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[90%]'>
                <p
                  key={step}
                  className='text-xs text-white/70 leading-relaxed transition-all duration-500'
                >
                  {citations[step].text}
                </p>
              </div>

              {/* Citation badge */}
              <div className='flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1.5 cursor-pointer hover:bg-indigo-500/20 transition-colors'>
                <Clock className='h-3 w-3 text-indigo-400' />
                <span className='text-xs text-indigo-300 font-medium'>
                  {citations[step].label}
                </span>
              </div>
            </div>

            {/* Typing indicator */}
            <div className='flex items-center gap-1 px-1'>
              <div className='h-1.5 w-1.5 rounded-full bg-white/20 animate-bounce [animation-delay:-0.3s]' />
              <div className='h-1.5 w-1.5 rounded-full bg-white/20 animate-bounce [animation-delay:-0.15s]' />
              <div className='h-1.5 w-1.5 rounded-full bg-white/20 animate-bounce' />
            </div>
          </div>

          {/* Input bar */}
          <div className='flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2'>
            <span className='text-xs text-white/20 flex-1'>
              Ask anything about your content...
            </span>
            <div className='h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0'>
              <ArrowRight className='h-3 w-3 text-white' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FEATURES = [
  {
    icon: Play,
    label: 'YouTube',
    description:
      'Paste any YouTube URL. LearnX downloads, transcribes, and indexes it — then jumps you to the exact moment your answer lives.',
  },
  {
    icon: FileVideo,
    label: 'Video',
    description:
      'Upload lectures, recordings, or tutorials. Every answer comes with a timestamp you can click to seek directly to.',
  },
  {
    icon: FileAudio,
    label: 'Audio',
    description:
      'Podcasts, voice memos, interviews. Transcribed and searchable — no more scrubbing through audio to find what you need.',
  },
  {
    icon: FileText,
    label: 'PDF',
    description:
      'Upload textbooks, papers, or notes. Answers cite the exact page, and your PDF viewer jumps there automatically.',
  },
];

const STEPS = [
  {
    icon: Zap,
    title: 'Upload your content',
    description:
      'Paste a YouTube link, upload a video, audio file, or PDF. LearnX handles the rest in the background.',
  },
  {
    icon: BookOpen,
    title: 'We index everything',
    description:
      'Your content is transcribed, chunked, and semantically indexed — ready for precise retrieval in seconds.',
  },
  {
    icon: MessageSquare,
    title: 'Chat with citations',
    description:
      'Ask anything. Every answer points back to the exact timestamp or page where the information lives.',
  },
];

const LandingPage = () => {
  return (
    <div className='min-h-screen bg-[#0a0a0a] text-white'>
      {/* Navbar */}
      <nav className='fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md'>
        <div className='max-w-6xl mx-auto px-6 h-14 flex items-center justify-between'>
          <span className='font-bold text-lg tracking-tight'>LearnX</span>
          <div className='flex items-center gap-3'>
            <Link
              to='/sign-in'
              className='text-sm font-medium text-white/70 hover:text-white transition-colors px-3 py-1.5'
            >
              Sign in
            </Link>
            <Link to='/sign-up'>
              <Button
                size='sm'
                className='bg-indigo-600 hover:bg-indigo-500 text-white border-0'
              >
                Get started free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className='pt-32 pb-24 px-6'>
        <div className='max-w-6xl mx-auto'>
          <div className='grid lg:grid-cols-2 gap-16 items-center'>
            {/* Left — copy */}
            <div className='space-y-8'>
              <div className='inline-flex items-center gap-2 border border-indigo-500/30 bg-indigo-500/10 rounded-full px-4 py-1.5'>
                <span className='h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse' />
                <span className='text-xs text-indigo-300 font-medium tracking-wide uppercase'>
                  RAG-powered learning
                </span>
              </div>

              <div className='space-y-4'>
                <h1 className='text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]'>
                  Chat with any{' '}
                  <span className='bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent'>
                    content.
                  </span>
                  <br />
                  Get cited answers.
                </h1>
                <p className='text-lg text-white/50 leading-relaxed max-w-md'>
                  Upload a YouTube video, lecture, podcast, or PDF. Ask
                  questions and get AI answers that jump you to the exact moment
                  or page — not just a summary.
                </p>
              </div>

              <div className='flex flex-wrap gap-3'>
                <Link to='/sign-up'>
                  <Button
                    size='lg'
                    className='bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-2'
                  >
                    Start for free
                    <ArrowRight className='h-4 w-4' />
                  </Button>
                </Link>
                <Link
                  to='/sign-in'
                  className='inline-flex items-center px-6 py-2.5 rounded-lg border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium'
                >
                  Sign in
                </Link>
              </div>

              {/* Supported formats */}
              <p className='text-xs text-white/30 tracking-wide'>
                SUPPORTS YOUTUBE · VIDEO · AUDIO · PDF
              </p>
            </div>

            {/* Right — animated demo */}
            <div className='hidden lg:block'>
              <HeroDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className='border-t border-white/5' />

      {/* Features */}
      <section className='py-24 px-6'>
        <div className='max-w-6xl mx-auto space-y-16'>
          <div className='text-center space-y-4'>
            <p className='text-xs text-indigo-400 font-medium tracking-widest uppercase'>
              What you can chat with
            </p>
            <h2 className='text-3xl lg:text-4xl font-bold tracking-tight'>
              Every format. One interface.
            </h2>
            <p className='text-white/50 max-w-md mx-auto'>
              No more rewinding lectures or ctrl+F through PDFs. Just ask.
            </p>
          </div>

          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.label}
                  className='group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-indigo-500/20 transition-all duration-300 space-y-4'
                >
                  <div className='h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center'>
                    <Icon className='h-5 w-5 text-indigo-400' />
                  </div>
                  <div className='space-y-2'>
                    <h3 className='font-semibold text-white'>{f.label}</h3>
                    <p className='text-sm text-white/50 leading-relaxed'>
                      {f.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className='border-t border-white/5' />

      {/* How it works */}
      <section className='py-24 px-6'>
        <div className='max-w-6xl mx-auto space-y-16'>
          <div className='text-center space-y-4'>
            <p className='text-xs text-indigo-400 font-medium tracking-widest uppercase'>
              How it works
            </p>
            <h2 className='text-3xl lg:text-4xl font-bold tracking-tight'>
              From upload to insight in minutes
            </h2>
          </div>

          <div className='grid sm:grid-cols-3 gap-8'>
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className='relative space-y-5'>
                  {i < STEPS.length - 1 && (
                    <div className='hidden sm:block absolute top-5 left-[calc(50%+20px)] right-[-50%] h-px bg-gradient-to-r from-white/10 to-transparent' />
                  )}
                  <div className='h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center'>
                    <Icon className='h-5 w-5 text-indigo-400' />
                  </div>
                  <div className='space-y-2'>
                    <h3 className='font-semibold text-white'>{step.title}</h3>
                    <p className='text-sm text-white/50 leading-relaxed'>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className='border-t border-white/5' />

      {/* CTA */}
      <section className='py-24 px-6'>
        <div className='max-w-2xl mx-auto text-center space-y-8'>
          <h2 className='text-4xl lg:text-5xl font-bold tracking-tight'>
            Stop re-watching.{' '}
            <span className='bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent'>
              Start understanding.
            </span>
          </h2>
          <p className='text-white/50 text-lg'>
            LearnX turns any media into a knowledge base you can actually have a
            conversation with.
          </p>
          <Link to='/sign-up'>
            <Button
              size='lg'
              className='bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-2 px-8'
            >
              Get started free
              <ArrowRight className='h-4 w-4' />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <div className='border-t border-white/5' />
      <footer className='py-8 px-6'>
        <div className='max-w-6xl mx-auto flex items-center justify-between'>
          <span className='font-bold text-white/40'>LearnX</span>
          <p className='text-xs text-white/20'>
            Built with ❤️ — AI-powered learning platform
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
