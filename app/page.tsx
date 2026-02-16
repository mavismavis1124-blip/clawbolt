import { Header } from '@/components/Header'
import { HeroVideo } from '@/components/HeroVideo'
import { LogoCloud } from '@/components/LogoCloud'
import { FeatureHighlights } from '@/components/FeatureHighlights'
import { TheWidget } from '@/components/TheWidget'
import { Comparison } from '@/components/Comparison'
import { HowItWorks } from '@/components/HowItWorks'
import { Marquee } from '@/components/Marquee'
import { Pricing } from '@/components/Pricing'
import { FAQ } from '@/components/FAQ'
import { Footer } from '@/components/Footer'
import { ScrollProgress } from '@/components/ScrollProgress'

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Header />
      <main id="main-content">
        <HeroVideo />
        <LogoCloud />
        <FeatureHighlights />
        <TheWidget />
        <Comparison />
        <HowItWorks />
        <Marquee />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </>
  )
}
