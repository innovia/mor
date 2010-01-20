rails_env = ENV['RAILS_ENV'] || 'production'
 
# 2 workers and 1 master
worker_processes (rails_env == 'production' ? 2 : 1)

# Load rails+github.git into the master before forking workers for super-fast worker spawn times
preload_app true
 
# Restart any workers that haven't responded in 30 seconds
timeout 30
 
# Listen on a Unix data socket
listen '/tmp/sockets/unicorn.sock', :backlog => 2048
  
before_fork do |server, worker|
  # 
  # When sent a USR2, Unicorn will suffix its pidfile with .oldbin and immediately start loading up a new version of itself 
  # (loaded with a new version of our app). When this new Unicorn is completely loaded it will begin spawning workers. 
  # 
  # The first worker spawned will check to see if an .oldbin pidfile exists. If so, this means we've just booted up a new Unicorn 
  # and need to tell the old one that it can now die.
  # To do so we send it a QUIT.
  #
  # Using this method we get 0 downtime deploys.
 
  old_pid = RAILS_ROOT + '/tmp/pids/unicorn.pid.oldbin'
  if File.exists?(old_pid) && server.pid != old_pid
    begin
      Process.kill("QUIT", File.read(old_pid).to_i)
    rescue Errno::ENOENT, Errno::ESRCH
      # someone else did our job for us
    end
  end
end


after_fork do |server, worker|
    # per-process listener ports for debugging/admin/migrations
    addr = "127.0.0.1:#{8080 + worker.nr}"
    server.listen(addr, :tries => -1, :delay => 5, :tcp_nopush => true)

    # the following is *required* for Rails + "preload_app true",
    
  defined?(ActiveRecord::Base) and
      ActiveRecord::Base.establish_connection
end