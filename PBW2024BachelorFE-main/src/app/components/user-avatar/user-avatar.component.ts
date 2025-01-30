import { NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss',
})
export class UserAvatarComponent {
  @Input() userName: string = '';
  @Input() userColor!: string;

  getInitials(name: string) {
    const nameParts = name.trim().split(' ');

    if (nameParts.length === 1) {
      // Only one name part, return the first letter
      return nameParts[0][0].toUpperCase();
    }

    // Take the first and last name parts only
    const firstNameInitial = nameParts[0][0].toUpperCase();
    const lastNameInitial = nameParts[nameParts.length - 1][0].toUpperCase();

    return `${firstNameInitial}${lastNameInitial}`;
  }
}
