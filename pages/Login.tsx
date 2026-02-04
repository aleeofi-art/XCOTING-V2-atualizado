const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  if (password !== confirmPassword) {
    setError('As senhas não coincidem.');
    return;
  }

  setIsSubmitting(true);

  try {
    // 1️⃣ Criar usuário
    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (signUpError) throw signUpError;
    if (!signUpData.user) throw new Error('Usuário não criado');

    // 2️⃣ Login (necessário para metadata e RLS)
    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) throw loginError;
    if (!loginData.user) throw new Error('Falha ao autenticar');

    const userId = loginData.user.id;

    // 3️⃣ Criar tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({ nome_empresa: name })
      .select()
      .single();

    if (tenantError) throw tenantError;

    // 4️⃣ Atualizar metadata do usuário
    await supabase.auth.updateUser({
      data: {
        tenant_id: tenant.id,
        name,
      },
    });

    // 5️⃣ Criar profile CORRETO
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,            // ✅ ID DO USUÁRIO
      name,
      email,
      role: 'operador',
      tenant_id: tenant.id,
    });

    if (profileError) throw profileError;

    navigate('/dashboard');

  } catch (err: any) {
    setError(err.message || 'Erro ao criar conta');
  } finally {
    setIsSubmitting(false);
  }
};
