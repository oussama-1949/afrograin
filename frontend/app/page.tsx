import Navbar from './components/layout/NavBar'
import Container from './components/ui/Container'
import Button from './components/ui/Button'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="py-20">
        <Container>
          <div className="max-w-xl">
            <h1
              className="text-5xl font-bold mb-6"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Produits africains authentiques au Maroc
            </h1>

            <p className="text-lg mb-8 text-gray-600">
              Découvrez une sélection premium de produits alimentaires africains,
              livrés directement chez vous.
            </p>

            <Link href="/products">
              <Button>Découvrir les produits</Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  )
}