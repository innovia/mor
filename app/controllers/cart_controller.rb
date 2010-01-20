class CartController < ApplicationController
  before_filter :require_user
end