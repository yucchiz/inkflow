import { ThemeToggleButton } from './ThemeToggleButton'
import './Header.css'

export function Header() {
  return (
    <header className="header">
      <h1 className="header__title">
        InkFlow
      </h1>
      <ThemeToggleButton />
    </header>
  )
}
