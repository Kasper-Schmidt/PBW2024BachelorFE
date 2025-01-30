import {
  Component,
  inject,
  Signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { userType } from '../../types/user.type';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';
import { TeamupStore } from '../../stores/teamup.store';
import { UserListComponent } from '../user-list/user-list.component';
import { DeviceTypeStore } from '../../stores/deviceTypes.store';
import { ClickupStore } from '../../stores/clickup.store';

@Component({
  selector: 'app-m-header',
  standalone: true,
  imports: [ButtonModule, CommonModule, UserAvatarComponent, UserListComponent],
  templateUrl: './m-header.component.html',
  styleUrl: './m-header.component.scss',
})
// M is for "mobile"
export class MHeaderComponent {
  protected readonly teamupStore = inject(TeamupStore);
  protected readonly clickupStore = inject(ClickupStore);
  protected readonly deviceTypeStore = inject(DeviceTypeStore);

  deviceType: Signal<string> = this.deviceTypeStore.device;
  userList: Signal<userType[]> = this.teamupStore.users;
  selectedUsers: Signal<userType[]> = this.clickupStore.activeMembers;
  searchString: Signal<string> = this.teamupStore.userSearchString;
  showLeftMenu = false;

  toggleMenuLeft() {
    this.showLeftMenu = !this.showLeftMenu;
  }

  close() {
    this.showLeftMenu = false;
  }

  searchUser(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const searchValue = inputElement.value;
    this.teamupStore.setSearchUserString(searchValue);
  }
}
