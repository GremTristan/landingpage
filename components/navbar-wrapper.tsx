"use client"

import { NavBar } from "@/components/ui/tubelight-navbar"
import { Home, User, Briefcase, FileText } from "lucide-react"

export function NavbarWrapper() {
  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'About', url: '#about', icon: User },
    { name: 'Projects', url: '#projects', icon: Briefcase },
    { name: 'Contact', url: '#contact', icon: FileText }
  ]

  return <NavBar items={navItems} />
}

