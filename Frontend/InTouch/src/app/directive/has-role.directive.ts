import { NgIf } from '@angular/common';
import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Role } from 'src/app/shared/models';

@Directive({
    selector: '[hasRole]',
    standalone: true,
    hostDirectives: [NgIf]
  })
  export class HasRoleDirective {
    private userRoles: Role[] = [];
  
    constructor(
      private templateRef: TemplateRef<any>,
      private viewContainer: ViewContainerRef,
      private authService: AuthService
    ) {
      const user = this.authService.getCurrentUserProfile();
      this.userRoles = user.roles;
    }
  
    @Input() set hasRole(requiredRoles: Role[]) {
        if (this.userRoles.some(role => requiredRoles.includes(role))) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
          this.viewContainer.clear();
        }
      }
  }