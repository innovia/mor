class MonqiClassForgery < Forgery
  def self.title
    dictionaries[:classes].random
  end
end