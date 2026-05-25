import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from '../../../core/services/auth';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout implements OnInit {
  readonly auth = inject(Auth);

  readonly nav: NavItem[] = [
    { path: '/dashboard', label: 'Hoy', icon: 'today' },
    { path: '/diary', label: 'Diario', icon: 'calendar_month' },
    { path: '/foods', label: 'Alimentos', icon: 'restaurant' },
    { path: '/progress', label: 'Progreso', icon: 'show_chart' },
    { path: '/plan', label: 'Plan semanal', icon: 'event_note' },
    { path: '/goals', label: 'Objetivos', icon: 'target' },
  ];

  ngOnInit(): void {
    this.auth.fetchMe().subscribe({ error: () => this.auth.logout() });
  }

  logout(): void {
    this.auth.logout();
  }
}
