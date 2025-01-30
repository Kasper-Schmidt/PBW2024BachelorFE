import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';
import { TeamupStore } from '../../stores/teamup.store';
import { ClickupStore } from '../../stores/clickup.store';
import { GlobalStore } from '../../stores/global.store';
import { userType } from '../../types/user.type';
@Component({
  selector: 'app-user-list',
  standalone: true,
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  imports: [CommonModule, UserAvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent {
  protected readonly teamupStore = inject(TeamupStore);
  protected readonly clickupStore = inject(ClickupStore);
  protected readonly globalStore = inject(GlobalStore);

  userList: Signal<userType[]> = this.teamupStore.users;
  searchString: Signal<string> = this.teamupStore.userSearchString;
  selectedUsers: Signal<userType[]> = this.clickupStore.activeMembers;

  @Output() close = new EventEmitter();

  closeSidebar() {
    this.close.emit();
  }

  getUserCalendar(email: string) {
    const startOfWeek = this.globalStore.showingWeek().startOfWeek;
    const endOfWeek = this.globalStore.showingWeek().endOfWeek;
  
    const user = this.teamupStore
      .users()
      .find((member: userType) => member.email === email);
  
    if (user) {
      const isMemberActive = this.clickupStore.toggleActiveMember(user);
  
      if (isMemberActive) {
        this.teamupStore.removeUserEvents(user.email);
      } else {
        this.teamupStore.setUserEvents(email, startOfWeek, endOfWeek);
        this.clickupStore.setTasks(email);
      }
    }

    this.closeSidebar();
  }

  isSelectedUser(email: string): boolean {
    const selected = this.selectedUsers(); // Returnerer true, hvis brugeren med den angivne email er blandt de valgte brugere.
    return selected && selected.some((sel) => sel.email === email);
  }
}
