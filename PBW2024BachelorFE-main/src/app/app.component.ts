import {
  Component,
  effect,
  EventEmitter,
  HostListener,
  inject,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TeamupService } from './services/teamup.service';
import { TeamupStore } from './stores/teamup.store';
import { ClickupStore } from './stores/clickup.store';
import { MHeaderComponent } from './components/m-header/m-header.component';
import { DeviceTypeStore } from './stores/deviceTypes.store';
import { GlobalStore } from './stores/global.store';
import { DataSideComponent } from './components/data-side/data-side.component';
import { UserListComponent } from './components/user-list/user-list.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    MHeaderComponent,
    DataSideComponent,
    UserListComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'bachelorfe';

  protected readonly teamupStore = inject(TeamupStore);
  protected readonly clickupStore = inject(ClickupStore);
  protected readonly deviceTypeStore = inject(DeviceTypeStore);
  protected readonly globalStore = inject(GlobalStore);

  deviceType: any = this.deviceTypeStore.device;

  selectedUsers: any = this.clickupStore.activeMembers;
  userList = this.teamupStore.users;
  searchString = this.teamupStore.userSearchString;

  @Output() closeUserList = new EventEmitter<any>();

  // Listen for window resize events
  @HostListener('window:resize', ['$event'])
  onResize(event?: Event) {
    const width = event
      ? (event.target as Window).innerWidth
      : this.fallBackDeviceType(); // Default width
    this.deviceTypeStore.updateDeviceType(width);
  }

  ngAfterViewInit(): void {
    this.teamupService.teamupAuthenticate().subscribe({
      next: () => {
        this.teamupStore.setUsers(); // Call setUsers after successful authentication
        this.teamupStore.setSubCalender();
        this.clickupStore.setMembers();
      },
      error: (error) => {
        console.error('Authentication failed:', error);
      },
    });
    const width =
      document.documentElement.clientWidth || this.fallBackDeviceType();
    this.deviceTypeStore.updateDeviceType(width);
  }

  constructor(private teamupService: TeamupService) {
    effect(() => {
      this.deviceType = this.deviceTypeStore.device;
    });
  }

  ngOnInit(): void {}

  fallBackDeviceType(): number {
    if (typeof navigator !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase();

      if (userAgent.includes('android') || userAgent.includes('iphone')) {
        return 640;
      } else if (userAgent.includes('ipad')) {
        return 768;
      } else {
        return 1280; // Desktop fallback width
      }
    } else {
      return 1280;
    }
  }

  close() {
    this.closeUserList.emit('close');
  }

  searchUser(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const searchValue = inputElement.value;
    this.teamupStore.setSearchUserString(searchValue);
  }
}
