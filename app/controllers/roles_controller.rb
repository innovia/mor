class RolesController < ApplicationController
   def index
     @person = Person.find(params[:person_id])
     @all_roles = Role.find(:all)
   end

   def update
     @person = Person.find(params[:person_id])
     @role = Role.find(params[:id])
     unless @person.has_role?(@role.title)
       @person.roles << @role
     end
     redirect_to person_roles_path
   end

   def destroy
     @person = Person.find(params[:person_id])
     @role = Role.find(params[:id])
     if @person.has_role?(@role.title)
       @person.roles.delete(@role)
       redirect_to person_roles_path
     else
       render :action => 'index'
     end
   end
end
