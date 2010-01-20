
def block
  puts "something out"
  1.times{puts "entering block"; return}
  puts "existing method"
end

block

def proc
  puts "something out"
  p = Proc.new{puts "entering proc";return}
  
  puts "existing method"
  p.call
end
proc

def proc_builder(msg)
  Proc.new{puts msg;return} 
end

def builder_test
  puts "entering builder test"
  p = proc_builder("hello ruby")
  p.call
  puts "existing method on builder test"
end

builder_test