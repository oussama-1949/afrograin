'use client'

import Link from 'next/link'
import Container from '../ui/Container'
import Button from '../ui/Button'
import { useAuthStore } from '../../store/auth'

export default function Navbar() {
  const { user } = useAuthStore()

  return (
    <nav className="bg-white shadow-sm">
      <Container>
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="text-xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
            Afrograin
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/products">Produits</Link>
            <Link href="/cart">Panier</Link>

            {user ? (
              <Link href="/dashboard">Compte</Link>
            ) : (
              <Link href="/auth/login">
                <Button>Connexion</Button>
              </Link>
            )}
          </div>
        </div>
      </Container>
    </nav>
  )
}