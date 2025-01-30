import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-theme-change',
  standalone: true,
  templateUrl: './theme-change.component.html',
  styleUrls: ['./theme-change.component.scss'],
})

export class ThemeChangeComponent implements OnInit {
  isDarkMode = false; 

  toggleTheme() {
    const htmlElement = document.documentElement;
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      htmlElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');  
    } else {
      htmlElement.classList.remove('dark');
      localStorage.setItem('theme', 'light'); 
    }
  }

  // Henter gemt tema ved siden bliver loaded
  ngOnInit() {                                                  // Lifecycle hook - ngOnInit() kaldes når komponenten initialiseres
    
    const savedTheme = localStorage.getItem('theme');           // Henter gemt tema fra localStorage
    if (savedTheme === 'dark') {                                // Tjekker om temaet er gemt som 'dark'
      this.isDarkMode = true;                                   // Sætter isDarkMode til true
      document.documentElement.classList.add('dark');           // Tilføjer 'dark' klasse til <html> for at aktivere dark mode
    }
}

}


